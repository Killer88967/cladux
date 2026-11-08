import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHighlighter } from "shiki";

// Highlights code for the Code tabs: one Shiki highlighter shared by every page,
// with each result saved in .next/cache, so the next build reuses it instead of
// highlighting the same code again. Change VERSION to start the cache over
// (after changing the themes, say).
const VERSION = 2;
// GitHub's high-contrast light theme: the only light one whose every color reads at
// 4.5:1 on the code background (WCAG AA). github-dark-default does in dark mode.
const THEMES = { light: "github-light-high-contrast", dark: "github-dark-default" } as const;
const LANGS = ["tsx", "html"] as const;
const CACHE = path.join(/* turbopackIgnore: true */ process.cwd(), ".next/cache/highlight");

let highlighter: ReturnType<typeof createHighlighter> | undefined;

export async function highlight(code: string, lang: (typeof LANGS)[number] = "tsx") {
  const key = createHash("sha1").update(`${VERSION}\0${lang}\0${code}`).digest("hex");
  const file = path.join(CACHE, `${key}.html`);
  const cached = await readFile(file, "utf8").catch(() => null);
  if (cached !== null) return cached;

  highlighter ??= createHighlighter({ themes: Object.values(THEMES), langs: [...LANGS] });
  const html = (await highlighter).codeToHtml(code, { lang, themes: THEMES });
  // The cache only saves time, so a failed write doesn't matter.
  await mkdir(CACHE, { recursive: true })
    .then(() => writeFile(file, html))
    .catch(() => {});
  return html;
}
