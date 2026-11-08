import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "toast"));

test("shows a toast from data attributes, with its description", async ({ page }) => {
  await page.getByRole("button", { name: "Show toast" }).click();
  const toast = page.getByRole("status").filter({ hasText: "Event has been created" });
  await expect(toast).toBeVisible();
  await expect(toast).toContainText("Sunday, December 03, 2026 at 9:00 AM");
  await expect(page.getByRole("list", { name: "Notifications" })).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("gives each type its own look, and errors are alerts", async ({ page }) => {
  await page.getByRole("button", { name: "Success" }).click();
  await expect(page.locator('.cl-toast[data-type="success"]')).toContainText("Changes saved");
  await page.getByRole("button", { name: "Error" }).click();
  await expect(page.getByRole("alert")).toContainText("Something went wrong");
});

test("stacks toasts with the newest in front", async ({ page }) => {
  for (const name of ["Show toast", "Success", "Error"]) {
    await page.getByRole("button", { name }).click();
  }
  await expect(page.locator(".cl-toast")).toHaveCount(3);
  await expect(page.locator(".cl-toast[data-front]")).toContainText("Something went wrong");
});

test("goes away by itself, and not while the pointer is on it", async ({ page }) => {
  await page.clock.install();
  await page.getByRole("button", { name: "Show toast" }).click();
  const toast = page.locator(".cl-toast").first();
  await toast.hover();
  await page.clock.runFor(6000);
  await expect(toast).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(6000);
  await expect(page.locator(".cl-toast:not([data-removed])")).toHaveCount(0);
});

test("has an action button and returns a function that dismisses it", async ({ page }) => {
  await page.evaluate(() => {
    (window as any).clicked = false;
    (window as any).dismiss = (window as any).cl.toast("Message archived", {
      action: { label: "Undo", onClick: () => ((window as any).clicked = true) },
      duration: Infinity,
    });
  });
  await page.getByRole("button", { name: "Undo" }).click();
  expect(await page.evaluate(() => (window as any).clicked)).toBe(true);
  await expect(page.locator(".cl-toast:not([data-removed])")).toHaveCount(0);

  await page.evaluate(() => (window as any).cl.toast.info("Hello", { duration: Infinity }));
  await expect(page.locator(".cl-toast:not([data-removed])")).toHaveCount(1);
});
