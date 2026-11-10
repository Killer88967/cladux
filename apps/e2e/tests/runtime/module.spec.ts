import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

// The ES module build (cl.mjs), loaded the way a bundler-free site would:
// <script type="module"> importing it from a URL. It starts nothing until
// start() is called, and puts nothing on window.

const packages = new URL("../../../../packages/", import.meta.url);
const read = (path: string) => readFile(new URL(path, packages), "utf8");

async function openWithModule(page: Page, example: string, script: string) {
  const files: Record<string, [string, string]> = {
    "/cl.css": ["text/css", await read("styles/dist/cl.css")],
    "/cl.mjs": ["text/javascript", await read("utils/dist/cl.mjs")],
    "/": [
      "text/html",
      `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
        `<link rel="stylesheet" href="/cl.css"></head>` +
        `<body style="padding: 4rem">${await read(`styles/examples/${example}.html`)}` +
        `<script type="module">${script}</script></body></html>`,
    ],
  };
  // A made-up site, so the module loads from a URL like it would from a CDN.
  await page.route("https://cladux.test/**", (route) => {
    const [contentType, body] = files[new URL(route.request().url()).pathname]!;
    return route.fulfill({ contentType, body });
  });
  await page.goto("https://cladux.test/");
}

test("does nothing until start() is called, and adds no global", async ({ page }) => {
  await openWithModule(
    page,
    "dialog",
    `import { start } from "/cl.mjs"; window.startCladux = start; window.loaded = true;`,
  );
  await page.waitForFunction(() => (window as unknown as { loaded?: boolean }).loaded);
  expect(await page.evaluate(() => "cl" in window)).toBe(false);

  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await page.getByRole("button", { name: "Edit profile" }).click();
  await expect(dialog).toBeHidden();

  await page.evaluate(() => (window as unknown as { startCladux: () => void }).startCladux());
  await page.getByRole("button", { name: "Edit profile" }).click();
  await expect(dialog).toBeVisible();
});

test("toast() from the module shows a toast, and its dismiss function removes it", async ({
  page,
}) => {
  await openWithModule(
    page,
    "toast",
    `import { start, toast } from "/cl.mjs";
     start();
     window.dismiss = toast("Saved from a module", { type: "success", duration: Infinity });`,
  );
  const toast = page.locator(".cl-toast").filter({ hasText: "Saved from a module" });
  await expect(toast).toBeVisible();
  await page.evaluate(() => (window as unknown as { dismiss: () => void }).dismiss());
  await expect(toast).toHaveCount(0);
});
