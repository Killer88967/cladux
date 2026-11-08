import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "dropdown-menu"));

test("opens below its button and marks it expanded", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Open menu" });
  const menu = page.getByRole("menu");
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  // Below the button, give or take the open animation's scale.
  const [t, m] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
  expect(m!.y).toBeGreaterThan(t!.y + t!.height - 4);
});

test("works from the keyboard", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  // Opening with the keyboard focuses the first item.
  await expect(page.getByRole("menuitem", { name: /Profile/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: /Settings/ })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: /Log out/ })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("menuitem", { name: /Profile/ })).toBeFocused();
  // Typing a letter jumps to the item that starts with it.
  await page.keyboard.press("s");
  await expect(page.getByRole("menuitem", { name: /Settings/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("toggles checkbox items and closes after a choice", async ({ page }) => {
  await page.getByRole("button", { name: "Open menu" }).click();
  const status = page.getByRole("menuitemcheckbox", { name: "Show status bar" });
  await expect(status).toHaveAttribute("aria-checked", "true");
  await status.click();
  await expect(page.getByRole("menu")).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(status).toHaveAttribute("aria-checked", "false");
  await page.getByRole("menuitem", { name: /Profile/ }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});
