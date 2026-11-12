import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "dialog"));

test("opens from its button and closes with the close buttons", async ({ page }) => {
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Edit profile" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("open");

  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Edit profile" }).click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

test("is modal: focus moves in, and Escape closes it", async ({ page }) => {
  await page.getByRole("button", { name: "Edit profile" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("closes on a click on the backdrop, but not inside", async ({ page }) => {
  await page.getByRole("button", { name: "Edit profile" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await dialog.getByLabel("Name", { exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test("closes when its form is submitted", async ({ page }) => {
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeHidden();
});

test("opens from script with cl.openDialog", async ({ page }) => {
  await page.evaluate(() => window.cl.openDialog("edit-profile"));
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible();
});

declare global {
  interface Window {
    cl: { openDialog: (id: string) => void; toast: any };
  }
}
