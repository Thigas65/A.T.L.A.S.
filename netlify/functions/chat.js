const MAX_MESSAGE_CHARS = 4000;

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...headers, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido." }) };
  }

  let body;
  try {
    if (typeof event.body !== "string" || event.body.length > 16000) {
      return { statusCode: 413, headers, body: JSON.stringify({ error: "Pedido muito grande." }) };
    }
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Pedido inválido." }) };
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Escreva uma mensagem para o ATLAS." }) };
  }
  const message = body.message.trim();
  if (message.length > MAX_MESSAGE_CHARS) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: "A mensagem deve ter até 4000 caracteres." }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: "Falta configurar GEMINI_API_KEY nas variáveis de ambiente do site hospedado." }) };
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Você é o ATLAS, um assistente útil, claro e respeitoso. Responda em português do Brasil, a menos que o usuário peça outro idioma." }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 700, temperature: 0.7 }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const status = response.status === 429 ? 429 : 502;
      return { statusCode: status, headers, body: JSON.stringify({ error: response.status === 429 ? "O Gemini atingiu o limite de uso ou a cota disponível." : "Não foi possível obter uma resposta do Gemini. Confira a chave, o modelo e a configuração da API." }) };
    }

    const data = await response.json();
    const answer = (data.candidates?.[0]?.content?.parts || [])
      .filter((part) => typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!answer) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "A IA não retornou texto nesta resposta." }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
  } catch {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Falha de conexão com a IA. Tente novamente mais tarde." }) };
  }
};
