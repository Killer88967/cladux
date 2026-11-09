import { expect, test, type Page } from "@playwright/test";
import { openExample } from "./fixture";

test.beforeEach(({ page }) => openExample(page, "combobox"));

const input = (page: Page) => page.getByRole("combobox", { name: "Framework" });
const list = (page: Page) => page.getByRole("listbox", { name: "Frameworks" });
const shown = (page: Page) => list(page).getByRole("option").allTextContents();

test("opens with every item when the input is clicked", async ({ page }) => {
  await expect(list(page)).toBeHidden();
  await input(page).click();
  await expect(list(page)).toBeVisible();
  await expect(input(page)).toHaveAttribute("aria-expanded", "true");
  expect(await shown(page)).toEqual(["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]);

  // 6px under the input and lined up with it, once it has grown in.
  const content = page.locator(".cl-combobox-content");
  await expect(content).toHaveCSS("scale", "1");
  const a = (await input(page).boundingBox())!;
  const b = (await content.boundingBox())!;
  expect(b.x).toBeCloseTo(a.x, 0);
  expect(b.y).toBeCloseTo(a.y + a.height + 6, 0);
});

test("filters as you type, and says when nothing matches", async ({ page }) => {
  await input(page).click();
  await page.keyboard.type("NUX");
  expect(await shown(page)).toEqual(["Nuxt.js"]);
  await page.keyboard.type("q");
  expect(await shown(page)).toEqual([]);
  await expect(page.getByText("No items found.")).toBeVisible();
});

test("picks with the arrow keys and Enter, and shows the pick when it opens again", async ({
  page,
}) => {
  await input(page).focus();
  await page.keyboard.press("ArrowDown");
  await expect(list(page)).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const highlighted = list(page).locator("[data-highlighted]");
  await expect(highlighted).toHaveText("SvelteKit");
  await expect(input(page)).toHaveAttribute(
    "aria-activedescendant",
    (await highlighted.getAttribute("id"))!,
  );

  await page.keyboard.press("Enter");
  await expect(list(page)).toBeHidden();
  await expect(input(page)).toHaveValue("SvelteKit");

  await input(page).click();
  const picked = list(page).getByRole("option", { name: "SvelteKit" });
  await expect(picked).toHaveAttribute("aria-selected", "true");
  await expect(picked).toHaveAttribute("data-highlighted");
});

test("picks with a click, and keeps the focus in the input", async ({ page }) => {
  await page.locator(".cl-combobox-trigger").click();
  await expect(list(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await list(page).getByRole("option", { name: "Astro" }).click();
  await expect(input(page)).toHaveValue("Astro");
  await expect(input(page)).toBeFocused();
  await expect(list(page)).toBeHidden();
});

test("Escape and clicking away close it and put the pick back", async ({ page }) => {
  await input(page).click();
  await list(page).getByRole("option", { name: "Remix" }).click();
  await input(page).click();
  await page.keyboard.type("zz");
  await page.keyboard.press("Escape");
  await expect(list(page)).toBeHidden();
  await expect(input(page)).toHaveValue("Remix");

  await input(page).click();
  await page.keyboard.press("Backspace");
  await page.mouse.click(5, 5);
  await expect(list(page)).toBeHidden();
  await expect(input(page)).toHaveValue("Remix");
});

test("sends the pick with a form through a hidden input", async ({ page }) => {
  await page.locator(".cl-combobox").evaluate((el) => {
    el.insertAdjacentHTML("beforeend", '<input type="hidden" name="framework">');
    el.querySelector<HTMLElement>(".cl-combobox-item:nth-child(2)")!.dataset.value = "sveltekit";
  });
  await input(page).click();
  await list(page).getByRole("option", { name: "SvelteKit" }).click();
  await expect(page.locator('input[name="framework"]')).toHaveValue("sveltekit");
});
