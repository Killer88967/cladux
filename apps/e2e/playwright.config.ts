import { defineConfig, devices } from "@playwright/test";

// The site is served from its production build, so run `pnpm build` first.
const PORT = 3100;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "runtime", testDir: "tests/runtime" },
    { name: "runtime-webkit", testDir: "tests/runtime", use: devices["Desktop Safari"] },
    { name: "runtime-firefox", testDir: "tests/runtime", use: devices["Desktop Firefox"] },
    { name: "site", testDir: "tests/site" },
    { name: "a11y", testDir: "tests/a11y", timeout: 120_000 },
    { name: "cli", testDir: "tests/cli", timeout: 15 * 60_000 },
  ],
  webServer: {
    command: `pnpm --filter www start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
