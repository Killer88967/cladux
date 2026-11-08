import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "accordion"));

test("opens one item at a time", async ({ page }) => {
  const items = page.locator(".cl-accordion-item");
  await expect(items.nth(0)).toHaveAttribute("open", "");
  await expect(page.getByText("We offer standard")).toBeVisible();

  await page.getByText("What is your return policy?").click();
  await expect(items.nth(1)).toHaveAttribute("open", "");
  await expect(items.nth(0)).not.toHaveAttribute("open");
  await expect(page.getByText("Returns accepted within 30 days")).toBeVisible();
  await expect(page.getByText("We offer standard")).toBeHidden();
});

test("works from the keyboard, and closes the open item again", async ({ page }) => {
  const first = page.locator(".cl-accordion-trigger").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".cl-accordion-item").first()).not.toHaveAttribute("open");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(page.locator(".cl-accordion-item").nth(1)).toHaveAttribute("open", "");
});

test("turns the chevron when an item opens", async ({ page }) => {
  const rotate = (n: number) =>
    page
      .locator(".cl-accordion-trigger")
      .nth(n)
      .evaluate((el) => getComputedStyle(el, "::after").rotate);
  expect(await rotate(0)).toBe("180deg");
  expect(await rotate(1)).toBe("none");
});

test("slides the open item shut, with cl.js", async ({ page }) => {
  const first = page.locator(".cl-accordion-item").first();
  const height = () => first.evaluate((el) => el.getBoundingClientRect().height);
  const open = await height();

  await page.getByText("What is your return policy?").click();
  await page.waitForTimeout(100);
  const midway = await height();
  expect(midway).toBeLessThan(open);
  expect(midway).toBeGreaterThan(open / 2 - 10);

  await expect(first).not.toHaveAttribute("open");
  await expect(first).toHaveAttribute("name", "faq");
  await expect(first).not.toHaveAttribute("data-closing");
});
