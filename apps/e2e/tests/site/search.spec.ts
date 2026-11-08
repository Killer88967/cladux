import { expect, test } from "@playwright/test";

test.beforeEach(({ page }) => page.goto("/docs"));

test("opens with ⌘K, finds a component and goes to it", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("combobox").fill("date range");
  const result = dialog.getByRole("option", { name: /Date Range Picker/ }).first();
  await expect(result).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/components\/date-range-picker$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Date Range Picker");
});

test("opens with / and from the button in the header", async ({ page }) => {
  await page.keyboard.press("/");
  await expect(page.getByRole("dialog", { name: "Search documentation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: /Search documentation/ }).click();
  await expect(page.getByRole("dialog", { name: "Search documentation" })).toBeVisible();
});

test("lists the docs before anything is typed", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  await expect(dialog.getByRole("group", { name: "Getting Started" })).toBeVisible();
  await expect(dialog.getByRole("option", { name: "Installation" })).toBeVisible();
});

test("finds sections inside pages and blocks", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  const input = page.getByRole("dialog").getByRole("combobox");

  await input.fill("pricing");
  await expect(page.getByRole("group", { name: "Blocks" })).toBeVisible();

  await input.fill("right-to-left");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("says when nothing matches", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("dialog").getByRole("combobox").fill("zzzzqqq");
  await expect(page.getByText('No results for "zzzzqqq".')).toBeVisible();
});
