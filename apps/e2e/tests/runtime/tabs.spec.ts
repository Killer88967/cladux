import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "tabs"));

test("shows the panel of the tab that's clicked", async ({ page }) => {
  const account = page.getByRole("tab", { name: "Account" });
  const password = page.getByRole("tab", { name: "Password" });
  await expect(page.getByRole("tabpanel", { name: "Account" })).toBeVisible();
  await expect(page.locator("#panel-password")).toBeHidden();

  await password.click();
  await expect(password).toHaveAttribute("aria-selected", "true");
  await expect(account).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tabpanel", { name: "Password" })).toBeVisible();
  await expect(page.locator("#panel-account")).toBeHidden();
});

test("keeps one tab in the tab order and moves with the arrow keys", async ({ page }) => {
  const account = page.getByRole("tab", { name: "Account" });
  const password = page.getByRole("tab", { name: "Password" });
  await expect(account).toHaveAttribute("tabindex", "0");
  await expect(password).toHaveAttribute("tabindex", "-1");

  await account.focus();
  await page.keyboard.press("ArrowRight");
  await expect(password).toBeFocused();
  await expect(password).toHaveAttribute("aria-selected", "true");
  // Past the last tab, it wraps around.
  await page.keyboard.press("ArrowRight");
  await expect(account).toBeFocused();
  await page.keyboard.press("End");
  await expect(password).toBeFocused();
  await page.keyboard.press("Home");
  await expect(account).toBeFocused();
});
