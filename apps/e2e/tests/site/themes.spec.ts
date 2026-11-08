import { expect, test } from "@playwright/test";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const primary = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--primary").trim(),
  );

test("builds a theme code from the choices and applies it to the page", async ({ page }) => {
  await page.goto("/themes");
  const before = await primary(page);

  await page.getByRole("button", { name: "Zinc" }).click();
  await page.getByRole("button", { name: "Violet" }).click();
  await page.getByRole("button", { name: "0.75" }).click();

  await expect(page).toHaveURL(/\?theme=zinc-violet-lg$/);
  await expect(page.getByRole("button", { name: "Violet" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await primary(page)).not.toBe(before);
});

test("opens the theme from the URL, and Reset goes back to the default", async ({ page }) => {
  await page.goto("/themes?theme=stone-rose-sm");
  await expect(page.getByRole("button", { name: "Stone" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Rose" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL(/\/themes$/);
  await expect(page.getByRole("button", { name: "Neutral" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Reset" })).toBeDisabled();
});

test("copies the theme code and its CSS in both styles", async ({ page }) => {
  await page.goto("/themes?theme=zinc-violet");
  await page.getByRole("button", { name: "Copy code" }).click();
  const dialog = page.getByRole("dialog", { name: "Theme" });
  await expect(dialog).toContainText("npx cladux-ui@latest apply zinc-violet");

  await dialog.getByRole("button", { name: "Copy theme code" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("zinc-violet");

  await dialog.getByRole("button", { name: "Copy", exact: true }).click();
  const tailwind = await page.evaluate(() => navigator.clipboard.readText());
  expect(tailwind).toContain("--primary:");
  expect(tailwind).not.toContain("--cl-primary:");

  await dialog.getByRole("tab", { name: "CSS" }).click();
  await dialog.getByRole("button", { name: /^Cop(y|ied)$/ }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("--cl-primary:");
});
