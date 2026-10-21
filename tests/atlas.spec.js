const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => { await page.goto("/"); });

test("carrega a tela inicial do ATLAS", async ({ page }) => {
  await expect(page).toHaveTitle(/ATLAS/);
  await expect(page.getByRole("heading", { name: "ATLAS" })).toBeVisible();
  await expect(page.locator("#chat-input")).toBeVisible();
  await expect(page.locator(".chat-note")).toContainText("sem conexão com IA");
});

test("abre Conversas e envia uma mensagem de demonstração", async ({ page }) => {
  await page.getByRole("button", { name: "Conversas" }).click();
  await expect(page.locator(".app")).toHaveClass(/chat-mode/);
  await page.locator("#chat-input").fill("Oi ATLAS");
  await page.locator("#chat-input").press("Enter");
  await expect(page.locator(".chat-message.user")).toContainText("Oi ATLAS");
  await expect(page.locator(".chat-message.atlas").last()).toContainText("Olá! Sou o ATLAS");
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
  await expect(page.locator("#panel-footnote")).toContainText("não está conectado a uma inteligência artificial");
});

test("mantém a navegação no celular e a oculta em telas grandes tipo TV", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".rail").first()).toBeVisible();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator(".rail").first()).toBeHidden();
  await expect(page.getByRole("heading", { name: "ATLAS" })).toBeVisible();
});
