import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "sheet"));

test("opens from its button and closes with the close buttons", async ({ page }) => {
  const sheet = page.getByRole("dialog", { name: "Edit profile" });
  await expect(sheet).toBeHidden();

  await page.getByRole("button", { name: "Open" }).click();
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).first().click();
  await expect(sheet).toBeHidden();

  await page.getByRole("button", { name: "Open" }).click();
  await sheet.getByRole("button", { name: "Close" }).last().click();
  await expect(sheet).toBeHidden();
});

test("closes with Escape and on a click on the backdrop, but not inside", async ({ page }) => {
  const sheet = page.getByRole("dialog", { name: "Edit profile" });
  await page.getByRole("button", { name: "Open" }).click();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  await page.getByRole("button", { name: "Open" }).click();
  await sheet.getByLabel("Name", { exact: true }).click();
  await expect(sheet).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(sheet).toBeHidden();
});

test("sits against the side in data-side", async ({ page }) => {
  const sheet = page.locator(".cl-sheet");
  const viewport = page.viewportSize()!;
  const box = async (side: string) => {
    await sheet.evaluate((el, s) => (el.dataset.side = s), side);
    await page.getByRole("button", { name: "Open" }).click();
    // After the slide in.
    await expect(sheet).toHaveCSS("translate", "0px");
    const b = (await sheet.boundingBox())!;
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    return b;
  };

  const right = await box("right");
  expect(right.x + right.width).toBeCloseTo(viewport.width, 0);
  expect(right.height).toBeCloseTo(viewport.height, 0);

  const left = await box("left");
  expect(left.x).toBe(0);
  expect(left.height).toBeCloseTo(viewport.height, 0);

  const top = await box("top");
  expect(top.y).toBe(0);
  expect(top.width).toBeCloseTo(viewport.width, 0);

  const bottom = await box("bottom");
  expect(bottom.y + bottom.height).toBeCloseTo(viewport.height, 0);
  expect(bottom.width).toBeCloseTo(viewport.width, 0);
});
