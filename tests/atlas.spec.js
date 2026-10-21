const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:8787/api/chat", async (route) => {
    const body = route.request().postDataJSON();
    const answer = /oi/i.test(body.message)
      ? "Olá! Sou o ATLAS. Resposta simulada pelo teste."
      : "Resposta simulada do Gemini para: " + body.message;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ answer }) });
  });
  await page.goto("/");
});

test("carrega a tela inicial do ATLAS", async ({ page }) => {
  await expect(page).toHaveTitle(/ATLAS/);
  await expect(page.getByRole("heading", { name: "ATLAS" })).toBeVisible();
  await expect(page.locator("#chat-input")).toBeVisible();
  await expect(page.locator(".chat-note")).toContainText("Gemini");
});

test("abre Conversas e envia uma mensagem de demonstração", async ({ page }) => {
  await page.getByRole("button", { name: "Conversas" }).click();
  await expect(page.locator(".app")).toHaveClass(/chat-mode/);
  await page.locator("#chat-input").fill("Oi ATLAS");
  await page.locator("#chat-input").press("Enter");
  await expect(page.locator(".chat-message.user")).toContainText("Oi ATLAS");
  await expect(page.locator(".chat-message.atlas").last()).toContainText("Resposta simulada pelo teste");
});

test("limpa o histórico de conversa", async ({ page }) => {
  await page.locator("#chat-input").fill("mensagem para limpar");
  await page.locator("#chat-input").press("Enter");
  await expect(page.locator(".chat-message")).toHaveCount(2);
  await page.getByRole("button", { name: "Limpar conversa" }).click();
  await expect(page.locator(".chat-message")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("atlas-demo-chat-v1"))).toBeNull();
});

test("abre Configurações e persiste a preferência de voz", async ({ page }) => {
  await page.getByRole("button", { name: "Configurações" }).click();
  await expect(page.locator(".app")).toHaveClass(/settings-mode/);
  const voice = page.locator("#voice-enabled");
  await expect(voice).toBeChecked();
  await voice.uncheck();
  await page.reload();
  await page.getByRole("button", { name: "Configurações" }).click();
  await expect(page.locator("#voice-enabled")).not.toBeChecked();
});

test("abre a tela de Ajuda", async ({ page }) => {
  await page.getByRole("button", { name: "Ajuda" }).click();
  await expect(page.locator(".app")).toHaveClass(/help-mode/);
  await expect(page.locator("#panel-heading")).toHaveText("Como testar o ATLAS");
  await expect(page.locator("#panel-footnote")).toContainText("Gemini");
});

test("mantém a navegação no celular e a oculta em telas grandes tipo TV", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".rail").first()).toBeVisible();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator(".rail").first()).toBeHidden();
  await expect(page.getByRole("heading", { name: "ATLAS" })).toBeVisible();
});

test("abre e fecha o menu lateral pelo botão e pela tecla Escape", async ({ page }) => {
  const menu = page.locator("#atlas-menu");
  const toggle = page.locator("#menu-toggle");
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(menu).toHaveAttribute("inert", "");
  await toggle.click();
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  await expect(menu).not.toHaveAttribute("inert", "");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(menu).toHaveAttribute("inert", "");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("menu informa quais recursos ainda estão planejados", async ({ page }) => {
  await page.locator("#menu-toggle").click();
  await page.getByRole("button", { name: "Memória do ATLAS" }).click();
  await expect(page.locator("#feature-heading")).toHaveText("Memória do ATLAS");
  await expect(page.locator("#feature-state")).toContainText("AINDA DESATIVADO");
  await page.locator("#menu-toggle").click();
  await page.getByRole("button", { name: "Laboratório" }).click();
  await expect(page.locator("#feature-heading")).toHaveText("Laboratório");
  await expect(page.locator("#feature-state")).toContainText("AINDA DESATIVADO");
});

test("botão de voz alterna entre ouvir e parar", async ({ page }) => {
  await page.addInitScript(() => {
    window.__mockRecognition = null;
    window.SpeechRecognition = class {
      constructor() { window.__mockRecognition = this; }
      start() {}
      stop() { if (this.onend) this.onend(); }
    };
  });
  await page.reload();
  const mic = page.getByRole("button", { name: "Áudio" });
  await expect(mic).toHaveAttribute("aria-pressed", "false");
  await mic.click();
  await expect(page.getByRole("button", { name: "Parar de ouvir" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".status")).toContainText("Ouvindo");
  await page.getByRole("button", { name: "Parar de ouvir" }).click();
  await expect(page.getByRole("button", { name: "Áudio" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".hint")).toContainText("Parei de ouvir");
});

test("voz informa quando o navegador não oferece reconhecimento", async ({ page }) => {
  await page.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await page.reload();
  await page.getByRole("button", { name: "Áudio" }).click();
  await expect(page.locator(".status")).toContainText("indisponível");
  await expect(page.locator(".hint")).toContainText("não oferece reconhecimento de voz");
});

test("shows saved conversation messages in the History menu", async ({ page }) => {
  await page.locator("#chat-input").fill("Lembrar esta mensagem");
  await page.locator("#chat-input").press("Enter");
  await page.locator("#menu-toggle").click();
  await page.getByRole("button", { name: "Histórico" }).click();
  await expect(page.locator("#feature-heading")).toHaveText("Histórico");
  await expect(page.locator(".history-list")).toContainText("Lembrar esta mensagem");
  await expect(page.locator(".history-list")).toContainText("ATLAS:");
});
