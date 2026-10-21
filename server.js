/* ATLAS API bridge — disabled by default.
 * Never expose this server directly to the public internet.
 * Requires Node.js 20+. No request text or API key is logged.
 */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || process.env.ATLAS_PORT || 10000);
const ROOT = __dirname;
const STATIC_FILES = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" }
};

function isSameOrigin(origin, req) {
  if (!origin) return true;
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return origin === proto + "://" + req.headers.host;
}
const MAX_BODY_BYTES = 16 * 1024;
const MAX_MESSAGE_CHARS = 4000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestsByAddress = new Map();

function sendJson(res, status, payload, origin) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin"
  });
  res.end(JSON.stringify(payload));
}

function allowedByRateLimit(address) {
  const now = Date.now();
  const previous = requestsByAddress.get(address);
  if (!previous || now - previous.startedAt >= WINDOW_MS) {
    requestsByAddress.set(address, { startedAt: now, count: 1 });
    return true;
  }
  if (previous.count >= MAX_REQUESTS_PER_WINDOW) return false;
  previous.count += 1;
  return true;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (!isSameOrigin(origin, req)) {
    sendJson(res, 403, { error: "Origem não permitida." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Cache-Control": "no-store" });
    res.end();
    return;
  }

  if (pathname === "/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, aiEnabled: process.env.ATLAS_AI_ENABLED === "true" });
    return;
  }

  if ((pathname === "/" || pathname === "/index.html" || pathname === "/app.js") && (req.method === "GET" || req.method === "HEAD")) {
    const asset = STATIC_FILES[pathname];
    try {
      const content = fs.readFileSync(path.join(ROOT, asset.file));
      res.writeHead(200, {
        "Content-Type": asset.type,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(req.method === "HEAD" ? undefined : content);
    } catch {
      sendJson(res, 500, { error: "Não foi possível carregar a interface do ATLAS." });
    }
    return;
  }

  if (pathname !== "/api/chat" || req.method !== "POST") {
    sendJson(res, 404, { error: "Rota não encontrada." });
    return;
  }

  if (!allowedByRateLimit(req.socket.remoteAddress || "unknown")) {
    sendJson(res, 429, { error: "Muitas solicitações. Aguarde um minuto e tente novamente." }, origin);
    return;
  }

  let raw = "";
  let tooLarge = false;
  req.on("data", (chunk) => {
    if (Buffer.byteLength(raw) + chunk.length > MAX_BODY_BYTES) {
      tooLarge = true;
      return;
    }
    raw += chunk.toString("utf8");
  });

  req.on("end", async () => {
    if (tooLarge) {
      sendJson(res, 413, { error: "Mensagem muito grande." }, origin);
      return;
    }

    let body;
    try {
      body = JSON.parse(raw || "{}");
    } catch {
      sendJson(res, 400, { error: "Pedido inválido." }, origin);
      return;
    }

    if (typeof body.message !== "string" || !body.message.trim()) {
      sendJson(res, 400, { error: "Escreva uma mensagem para o ATLAS." }, origin);
      return;
    }
    const message = body.message.trim();
    if (message.length > MAX_MESSAGE_CHARS) {
      sendJson(res, 413, { error: "A mensagem deve ter até 4000 caracteres." }, origin);
      return;
    }

    // Default stays off even if a key happens to exist in the environment.
    if (process.env.ATLAS_AI_ENABLED !== "true") {
      sendJson(res, 503, { error: "A IA real está desativada. Nenhuma chamada paga foi feita." }, origin);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    if (!apiKey) {
      sendJson(res, 503, { error: "A chave GEMINI_API_KEY não está configurada no servidor. Nenhuma chamada foi feita." }, origin);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "Você é o ATLAS, um assistente útil, claro e respeitoso. Responda em português do Brasil, a menos que o usuário peça outro idioma." }]
          },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.7 }
        }),
        signal: AbortSignal.timeout(30_000)
      });

      if (!response.ok) {
        sendJson(res, response.status === 429 ? 429 : 502, {
          error: response.status === 429
            ? "O Gemini atingiu o limite de uso ou a cota disponível."
            : "Não foi possível obter uma resposta do Gemini. Confira a configuração da API."
        }, origin);
        return;
      }

      const data = await response.json();
      const answer = (data.candidates?.[0]?.content?.parts || [])
        .filter((part) => typeof part.text === "string")
        .map((part) => part.text)
        .join("\n")
        .trim();

      if (!answer) {
        sendJson(res, 502, { error: "A IA não retornou texto nesta resposta." }, origin);
        return;
      }
      sendJson(res, 200, { answer }, origin);
    } catch {
      sendJson(res, 502, { error: "Falha de conexão com a IA. Tente novamente mais tarde." }, origin);
    }
  });
});

server.listen(PORT, HOST, () => {
  // Deliberately log only the listening address, never configuration secrets.
  console.log(`ATLAS pronto em http://${HOST}:${PORT} (IA desativada por padrão)`);
});
