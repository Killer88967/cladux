import { expect, test } from "@playwright/test";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = (page: import("@playwright/test").Page) =>
  page.evaluate(() => navigator.clipboard.readText());

test("copies an install command for the package manager that's picked", async ({ page }) => {
  await page.goto("/docs/installation");
  const command = page.locator("pre code").filter({ hasText: "cladux-ui" }).first();
  const block = command.locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");

  await block.getByRole("tab", { name: "npm", exact: true }).click();
  await block.getByRole("button", { name: "Copy code" }).click();
  expect(await clipboard(page)).toMatch(/^npx cladux-ui@latest /);
  await expect(block.getByRole("button", { name: "Copied" })).toBeVisible();

  await block.getByRole("tab", { name: "pnpm", exact: true }).click();
  await block.getByRole("button", { name: /Cop(y code|ied)/ }).click();
  expect(await clipboard(page)).toMatch(/^pnpx cladux-ui@latest /);
});

test("copies a component's source from its Code tab", async ({ page }) => {
  await page.goto("/docs/components/button");
  await page.getByRole("tab", { name: "Code" }).first().click();
  const panel = page.getByRole("tabpanel").filter({ hasText: "export default" }).first();
  await panel.getByRole("button", { name: "Copy code" }).click();
  const text = await clipboard(page);
  expect(text).toContain("export default function");
  expect(text).toContain('from "@cladux/ui"');
});

test("copies a code block from the docs exactly as shown", async ({ page }) => {
  await page.goto("/docs/components/button");
  const block = page
    .locator("figure, div")
    .filter({ has: page.locator("pre") })
    .filter({
      hasText: 'import { Button } from "@cladux/ui"',
    });
  const pre = block.locator("pre").first();
  const shown = await pre.innerText();
  await block.getByRole("button", { name: "Copy code" }).first().click();
  expect((await clipboard(page)).trim()).toBe(shown.trim());
});
