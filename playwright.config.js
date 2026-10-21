const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", browserName: "chromium", headless: true },
  webServer: {
    command: "npx http-server . -p 4173 -s",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
