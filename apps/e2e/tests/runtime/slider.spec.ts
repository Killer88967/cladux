import { expect, test } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "slider"));

const fill = (slider: import("@playwright/test").Locator) =>
  slider.evaluate((el) => el.style.getPropertyValue("--cl-slider-fill"));

test("fills the track up to the value when the page loads", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await expect(slider).toHaveValue("75");
  expect(await fill(slider)).toBe("75%");
});

test("moves with the keyboard and keeps the fill with it", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("76");
  expect(await fill(slider)).toBe("76%");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  expect(await fill(slider)).toBe("0%");
});

test("fills again after a form reset", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await slider.evaluate((el) => {
    const form = document.createElement("form");
    el.replaceWith(form);
    form.append(el);
  });
  await slider.focus();
  await page.keyboard.press("End");
  expect(await fill(slider)).toBe("100%");

  await slider.evaluate((el) => (el as HTMLInputElement).form!.reset());
  await expect(slider).toHaveValue("75");
  await expect.poll(() => fill(slider)).toBe("75%");
});
