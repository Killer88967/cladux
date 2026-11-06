// Writes public/search.json, what the search box (⌘K) looks through: every docs
// page and each of its sections, every block, the examples and the other pages.
// The search box loads it the first time it opens.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { blocks } from "../../../packages/ui/src/blocks/_blocks.ts";
import { charts } from "../../../packages/ui/src/charts/_charts.ts";
import type { SearchEntry } from "../src/lib/search.ts";
import { exampleNav, mainNav } from "../src/lib/site.ts";

const ROOT = new URL("../../../", import.meta.url);
const DOCS = new URL("apps/www/src/content/docs/", ROOT);

const GROUPS: Record<string, string> = { "": "Getting Started", components: "Components" };

/** The same ids the docs pages give their headings (headingId in doc-heading.tsx). */
const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Markdown and MDX down to the words someone would search for. */
const plain = (text: string) =>
  text
    .replace(/^```[\s\S]*?^```/gm, " ")
    .replace(/^<[\s\S]*?>[ \t]*$/gm, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(?:[-*]|\d+\.) /gm, "")
    .replace(/[`*_>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** The start of a section's text, cut at a word. */
const snippet = (text: string, length = 140) =>
  text.length <= length ? text : `${text.slice(0, text.lastIndexOf(" ", length))}…`;

const pages: (SearchEntry & { order: number; key: string })[] = [];
const sections: SearchEntry[] = [];

for (const file of await readdir(DOCS, { recursive: true })) {
  if (!file.endsWith(".mdx")) continue;
  const parts = file.slice(0, -4).split(path.sep);
  const slug = parts.at(-1) === "index" ? parts.slice(0, -1) : parts;
  const key = slug.length > 1 ? slug[0]! : "";
  const href = `/docs/${slug.join("/")}`.replace(/\/$/, "");
  const source = await readFile(new URL(file, DOCS), "utf8");

  // The metadata is our own JS object literal, so evaluate it instead of parsing it.
  const block = /^export const metadata = (\{[\s\S]*?\n\});\n/m.exec(source);
  const meta = block ? new Function(`return ${block[1]}`)() : {};
  const title: string = meta.title ?? slug.at(-1) ?? "Docs";
  const group = GROUPS[key] ?? key;
  pages.push({
    group,
    title,
    href,
    text: meta.description,
    order: meta.order ?? Number.POSITIVE_INFINITY,
    key,
  });

  // Each ## and ### heading, with the text under it. Headings inside code blocks don't count.
  const body = source
    .replace(block?.[0] ?? "", "")
    .replace(/^```[\s\S]*?^```/gm, (code) => code.replace(/^#/gm, " #"));
  const used = new Map<string, number>();
  const chunks = body.split(/^(#{2,3} .+)$/m);
  for (let i = 1; i < chunks.length; i += 2) {
    const heading = plain(chunks[i]!.replace(/^#+ /, ""));
    const base = headingId(heading);
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    const text = plain(chunks[i + 1] ?? "");
    sections.push({
      group,
      title: heading,
      parent: title,
      href: `${href}#${n === 1 ? base : `${base}-${n}`}`,
      ...(text ? { text: snippet(text) } : {}),
    });
  }
}

// Sidebar order: Getting Started, then Components, each by order and then title.
pages.sort(
  (a, b) =>
    (a.key === "" ? 0 : 1) - (b.key === "" ? 0 : 1) ||
    a.order - b.order ||
    a.title.localeCompare(b.title),
);

const entries: SearchEntry[] = [
  ...pages.map(({ order: _order, key: _key, ...entry }) => entry),
  ...blocks.map((b) => ({
    group: "Blocks",
    title: b.title,
    href: `/blocks#${b.name}`,
    text: `${b.description} ${b.category} · ${b.name}`,
  })),
  ...charts.map((c) => ({
    group: "Charts",
    title: c.title,
    href: `/charts#${c.name}`,
    text: `${c.description} ${c.type} chart · ${c.name}`,
  })),
  ...exampleNav.map((e) => ({ group: "Examples", title: e.title, href: e.href })),
  ...mainNav
    .filter((n) => !n.href.startsWith("/docs"))
    .map((n) => ({ group: "Pages", title: n.title, href: n.href })),
  ...sections,
];

await writeFile(new URL("apps/www/public/search.json", ROOT), JSON.stringify(entries));
console.log(`search: ${pages.length} pages, ${sections.length} sections, ${blocks.length} blocks`);
