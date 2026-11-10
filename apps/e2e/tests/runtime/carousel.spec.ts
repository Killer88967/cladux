import { expect, test, type Page } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "carousel"));

const content = (page: Page) => page.locator(".cl-carousel-content");
const scrolled = (page: Page) => content(page).evaluate((el) => Math.round(el.scrollLeft));
const step = (page: Page) =>
  page
    .locator(".cl-carousel-item")
    .first()
    .evaluate((el) => (el as HTMLElement).offsetWidth + 16);

test("the buttons move one slide and turn off at the ends", async ({ page }) => {
  const previous = page.getByRole("button", { name: "Previous slide" });
  const next = page.getByRole("button", { name: "Next slide" });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  const size = await step(page);
  await next.click();
  await expect.poll(() => scrolled(page)).toBe(size);
  await expect(previous).toBeEnabled();

  for (let i = 0; i < 3; i++) await next.click();
  await expect.poll(() => scrolled(page)).toBe(size * 4);
  await expect(next).toBeDisabled();
});

test("labels the slides and moves with the arrow keys, two at a time when pressed twice", async ({
  page,
}) => {
  const slides = page.getByRole("group");
  await expect(slides).toHaveCount(5);
  await expect(slides.first()).toHaveAttribute("aria-label", "1 of 5");
  await expect(slides.first()).toHaveAttribute("aria-roledescription", "slide");

  const size = await step(page);
  await content(page).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => scrolled(page)).toBe(size * 2);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => scrolled(page)).toBe(size);
});

test("a mouse drags it to the next slide, or back when it's only a nudge", async ({ page }) => {
  const size = await step(page);
  const box = (await content(page).boundingBox())!;
  const y = box.y + box.height / 2;
  const drag = async (by: number) => {
    await page.mouse.move(box.x + 200, y);
    await page.mouse.down();
    await page.mouse.move(box.x + 200 - by, y, { steps: 8 });
    await page.mouse.up();
  };

  await drag(120);
  await expect.poll(() => scrolled(page)).toBe(size);
  await expect(content(page)).not.toHaveAttribute("data-dragging");

  await drag(30);
  await expect.poll(() => scrolled(page)).toBe(size);
});

test("stacks the slides when vertical", async ({ page }) => {
  await page.locator(".cl-carousel").evaluate((el) => {
    el.dataset.orientation = "vertical";
    el.querySelector<HTMLElement>(".cl-carousel-content")!.style.height = "270px";
  });
  const size = await page
    .locator(".cl-carousel-item")
    .first()
    .evaluate((el) => (el as HTMLElement).offsetHeight + 16);
  await page.getByRole("button", { name: "Next slide" }).click();
  await expect.poll(() => content(page).evaluate((el) => Math.round(el.scrollTop))).toBe(size);
});
