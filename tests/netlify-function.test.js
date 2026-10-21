const { test } = require("node:test");
const assert = require("node:assert/strict");
const { handler } = require("../netlify/functions/chat.js");

const request = (httpMethod, body) => ({
  httpMethod,
  body: body === undefined ? undefined : JSON.stringify(body)
});

test("Netlify chat function validates requests and handles Gemini responses", async () => {
  const previousEnabled = process.env.ATLAS_AI_ENABLED;
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_MODEL;
  const originalFetch = global.fetch;

  try {
    let response = await handler(request("GET"));
    assert.equal(response.statusCode, 405);

    response = await handler({ httpMethod: "POST", body: "{invalid json" });
    assert.equal(response.statusCode, 400);

    process.env.ATLAS_AI_ENABLED = "false";
    response = await handler(request("POST", { message: "Oi" }));
    assert.equal(response.statusCode, 503);

    process.env.ATLAS_AI_ENABLED = "true";
    delete process.env.GEMINI_API_KEY;
    response = await handler(request("POST", { message: "Oi" }));
    assert.equal(response.statusCode, 503);
    assert.match(JSON.parse(response.body).error, /GEMINI_API_KEY/);

    process.env.GEMINI_API_KEY = "test-only-key";
    global.fetch = async (_url, options) => {
      assert.equal(options.method, "POST");
      assert.equal(options.headers["x-goog-api-key"], "test-only-key");
      const payload = JSON.parse(options.body);
      assert.equal(payload.contents[0].parts[0].text, "Oi ATLAS");
      return {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Resposta simulada do Gemini." }] } }]
        })
      };
    };

    response = await handler(request("POST", { message: "Oi ATLAS" }));
    assert.equal(response.statusCode, 200);
    assert.equal(JSON.parse(response.body).answer, "Resposta simulada do Gemini.");

    global.fetch = async () => ({ ok: false, status: 429 });
    response = await handler(request("POST", { message: "Oi ATLAS" }));
    assert.equal(response.statusCode, 429);
  } finally {
    global.fetch = originalFetch;
    if (previousEnabled === undefined) delete process.env.ATLAS_AI_ENABLED;
    else process.env.ATLAS_AI_ENABLED = previousEnabled;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previousModel;
  }
});
