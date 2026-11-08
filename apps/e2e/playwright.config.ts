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
    // The plain HTML runtime (cl.js and cl.css), on the example pages.
    { name: "runtime", testDir: "tests/runtime" },
    // The site: search, the theme customizer, copy buttons.
    { name: "site", testDir: "tests/site" },
    // axe on every docs page and block.
    // Pages with thousands of elements take axe a while.
    { name: "a11y", testDir: "tests/a11y", timeout: 120_000 },
    // The CLI in fresh Next.js and Vite apps. Slow, and needs npm: run on its own.
    { name: "cli", testDir: "tests/cli", timeout: 15 * 60_000 },
  ],
  webServer: {
    command: `pnpm --filter www start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
