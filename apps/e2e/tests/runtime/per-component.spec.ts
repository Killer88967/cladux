import { readdir, readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

// core.css plus the files for the components a page uses must style it exactly
// like cl.css. Checked on every example page, element by element.

const styles = new URL("../../../../packages/styles/", import.meta.url);
const read = (path: string) => readFile(new URL(path, styles), "utf8");

const examples = (await readdir(new URL("examples/", styles))).map((file) => file.slice(0, -5));
const components = (await readdir(new URL("dist/components/", styles)))
  .filter((file) => !file.endsWith(".min.css"))
  .map((file) => file.slice(0, -4))
  // Longest first, so cl-dropdown-menu doesn't count as a "dropdown" something.
  .sort((a, b) => b.length - a.length);

/** The component files an example's classes need. Layout helpers are in core.css. */
function needed(html: string) {
  const files = new Set<string>();
  for (const [, cls] of html.matchAll(/\bcl-([a-z-]+)/g)) {
    const name = cls === "menu" || cls!.startsWith("menu-") ? "dropdown-menu" : cls!;
    const file = components.find((c) => name === c || name.startsWith(`${c}-`));
    if (file) files.add(file);
  }
  return [...files];
}

async function computed(page: Page, css: string, html: string) {
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head>` +
      `<body style="padding: 4rem">${html}</body></html>`,
  );
  return page.evaluate(() =>
    [...document.body.querySelectorAll("*")].map((el) => {
      const style = getComputedStyle(el);
      const out: Record<string, string> = {};
      for (const property of style) out[property] = style.getPropertyValue(property);
      return { el: el.outerHTML.slice(0, 80), style: out };
    }),
  );
}

for (const name of examples) {
  test(`${name}: core.css and its component files match cl.css`, async ({ page }) => {
    const html = await read(`examples/${name}.html`);
    const files = needed(html).sort();
    const whole = await computed(page, await read("dist/cl.css"), html);

    // In either order: the files don't depend on which one loads first.
    for (const order of [files, [...files].reverse()]) {
      const parts = await Promise.all([
        read("dist/core.css"),
        ...order.map((file) => read(`dist/components/${file}.css`)),
      ]);
      expect(await computed(page, parts.join("\n"), html), order.join(", ")).toEqual(whole);
    }
  });
}
