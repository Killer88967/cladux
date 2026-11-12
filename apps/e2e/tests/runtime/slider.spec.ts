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

test("fills a slider added to the page later", async ({ page }) => {
  await page.evaluate(() => {
    const box = document.createElement("div");
    box.innerHTML = '<input class="cl-slider" type="range" value="30" aria-label="Later">';
    document.body.append(box);
  });
  await expect.poll(() => fill(page.getByRole("slider", { name: "Later" }))).toBe("30%");
});

test("drags from anywhere on the track with a finger", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "touch is sent through Chromium's DevTools protocol");
  const slider = page.getByRole("slider", { name: "Volume" });
  const box = (await slider.boundingBox())!;
  const y = box.y + box.height / 2;
  const at = (ratio: number) => box.x + 6 + ratio * (box.width - 12);
  await slider.evaluate((el) => {
    (window as unknown as { changes: number }).changes = 0;
    el.addEventListener("change", () => (window as unknown as { changes: number }).changes++);
  });

  // A real touch, so the browser makes touch pointer events from it.
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchCancel" | "touchEnd" | "touchMove" | "touchStart", x: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });

  await touch("touchStart", at(0.2));
  await expect(slider).toHaveValue("20");
  await touch("touchMove", at(0.5));
  await touch("touchMove", at(0.9));
  await expect(slider).toHaveValue("90");
  expect(await fill(slider)).toBe("90%");
  await touch("touchEnd", 0);
  expect(await page.evaluate(() => (window as unknown as { changes: number }).changes)).toBe(1);
});
