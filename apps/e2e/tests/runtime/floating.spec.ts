import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test("a popover opens next to its button and closes on Escape", async ({ page }) => {
  await openExample(page, "popover");
  const trigger = page.getByRole("button", { name: "Open popover" });
  const popover = page.locator("#dimensions");
  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const [t, p] = await Promise.all([trigger.boundingBox(), popover.boundingBox()]);
  expect(Math.abs(p!.y - (t!.y + t!.height))).toBeLessThan(20);
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("a tooltip shows on hover and keyboard focus, above its button", async ({ page }) => {
  await openExample(page, "tooltip");
  const trigger = page.getByRole("button", { name: "Hover" });
  const tip = page.getByRole("tooltip");
  await expect(tip).toBeHidden();

  await trigger.hover();
  await expect(tip).toBeVisible();
  const [t, b] = await Promise.all([tip.boundingBox(), trigger.boundingBox()]);
  expect(t!.y + t!.height).toBeLessThan(b!.y + 4);

  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();

  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(tip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
});
