import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";

const root = new URL("../../../../packages/", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

let assets: Promise<{ css: string; js: string }> | undefined;
const loadAssets = () =>
  (assets ??= Promise.all([read("styles/dist/cl.css"), read("utils/dist/cl.js")]).then(
    ([css, js]) => ({ css, js }),
  ));

/**
 * Opens one of packages/styles/examples on a blank page with the built
 * cl.css and cl.js, the way a plain HTML site would use them.
 */
export async function openExample(page: Page, name: string) {
  const [{ css, js }, html] = await Promise.all([
    loadAssets(),
    read(`styles/examples/${name}.html`),
  ]);
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head>` +
      `<body style="padding: 4rem">${html}<script>${js}</script></body></html>`,
  );
}
