// Writes the docs for AI assistants (https://llmstxt.org):
// - public/llms.txt: a map of the docs, with a link to each page's Markdown
// - public/llms-full.txt: every page in one file
// - public/docs/<page>.md: each page as Markdown, at its URL plus .md
// Runs after scripts/registry.ts, which writes the index.json it reads.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getInstall } from "../src/lib/docs.ts";
import { site } from "../src/lib/site.ts";

const ROOT = new URL("../../../", import.meta.url);
const DOCS = new URL("apps/www/src/content/docs/", ROOT);
const PUBLIC = new URL("apps/www/public/", ROOT);
const URL_BASE = "https://cladux.vercel.app";
const CLI = "npx cladux-ui@latest";

interface Page {
  slug: string[];
  title: string;
  description?: string;
  order: number;
  isNew?: boolean;
  mdx: string;
}

/** "/docs/components/button" for a slug, and its Markdown at the same URL plus .md. */
const href = (slug: string[]) => `/docs/${slug.join("/")}`.replace(/\/$/, "");
const mdUrl = (slug: string[]) => `${URL_BASE}${href(slug)}.md`;

// Every demo's source, by name, for the previews on the pages.
const UI = new URL("packages/ui/src/", ROOT);
const demos = new Map<string, URL>();
for (const dir of await readdir(UI, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const files = await readdir(new URL(`${dir.name}/examples/`, UI)).catch(() => []);
  for (const file of files) {
    if (file.endsWith(".tsx"))
      demos.set(file.slice(0, -4), new URL(`${dir.name}/examples/${file}`, UI));
  }
}
const HTML_DEMOS = new URL("packages/styles/examples/", ROOT);

// Read every page and its metadata.
const pages: Page[] = [];
for (const file of await readdir(DOCS, { recursive: true })) {
  if (!file.endsWith(".mdx")) continue;
  const parts = file.slice(0, -4).split(path.sep);
  const slug = parts.at(-1) === "index" ? parts.slice(0, -1) : parts;
  const mdx = await readFile(new URL(file, DOCS), "utf8");
  // The metadata is our own JS object literal, so evaluate it instead of parsing it.
  const block = /^export const metadata = (\{[\s\S]*?\n\});\n/m.exec(mdx);
  const meta = block ? new Function(`return ${block[1]}`)() : {};
  pages.push({
    slug,
    title: meta.title ?? slug.at(-1) ?? "Docs",
    description: meta.description,
    order: meta.order ?? Number.POSITIVE_INFINITY,
    isNew: meta.new,
    mdx: mdx.replace(block?.[0] ?? "", ""),
  });
}
// Sidebar order: Getting Started, then Components, each by order and then title.
const group = (page: Page) => (page.slug.length > 1 ? page.slug[0]! : "");
pages.sort(
  (a, b) =>
    (group(a) === "" ? 0 : 1) - (group(b) === "" ? 0 : 1) ||
    a.order - b.order ||
    a.title.localeCompare(b.title),
);
const components = pages.filter((p) => group(p) === "components");

const fence = (lang: string, code: string) => `\`\`\`${lang}\n${code.trim()}\n\`\`\``;
const attr = (tag: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];

/** What the site renders for each of our MDX components, as Markdown. */
async function replaceComponents(text: string) {
  const tags = [...text.matchAll(/^<(\/?)([A-Z]\w*)\b[\s\S]*?>[ \t]*$/gm)];
  const swaps = await Promise.all(
    tags.map(async ([tag, closing, name]) => {
      if (closing) return "";
      switch (name) {
        case "ComponentPreview": {
          const file = demos.get(attr(tag, "name") ?? "");
          return file ? fence("tsx", await readFile(file, "utf8")) : "";
        }
        case "HtmlPreview": {
          const file = new URL(`${attr(tag, "name")}.html`, HTML_DEMOS);
          return existsSync(file) ? fence("html", await readFile(file, "utf8")) : "";
        }
        case "CliCommand": {
          const packages = attr(tag, "packages");
          return fence(
            "bash",
            packages ? `npm install ${packages}` : `${CLI} ${attr(tag, "args")}`,
          );
        }
        case "ComponentsList": {
          const list = attr(tag, "only") === "new" ? components.filter((p) => p.isNew) : components;
          return list.map((p) => `- [${p.title}](${mdUrl(p.slug)})`).join("\n");
        }
        default:
          // Wrappers such as <StyleTabs>: keep what's inside, drop the tag.
          return "";
      }
    }),
  );
  let i = 0;
  return text.replace(/^<(\/?)([A-Z]\w*)\b[\s\S]*?>[ \t]*$/gm, () => swaps[i++]!);
}

/** One page as Markdown: what the site shows, with code in place of live previews. */
async function toMarkdown(page: Page) {
  // Leave code blocks alone; only the text between them has components.
  const parts = page.mdx.split(/(^```[\s\S]*?^```)/m);
  let body = (
    await Promise.all(parts.map((part, i) => (i % 2 ? part : replaceComponents(part))))
  ).join("");

  // Component pages get an Installation section before "Usage", like on the site.
  const install = await getInstall(page.slug);
  if (install) {
    const section = [
      "## Installation",
      fence("bash", `${CLI} add ${install.items.join(" ")}`),
      ...(install.packages
        ? ["The examples on this page also use:", fence("bash", `npm install ${install.packages}`)]
        : []),
    ].join("\n\n");
    body = body.replace(new RegExp(`^## \`?${install.before}\`?$`, "m"), `${section}\n\n$&`);
  }

  // Links to other docs pages point at their Markdown, so assistants can follow them.
  body = body.replace(
    /\]\(\/docs([^)#\s]*?)(?:\.md)?(#[^)\s]*)?\)/g,
    (_, rest: string, hash = "") => {
      return `](${URL_BASE}/docs${rest}.md${hash})`;
    },
  );

  const head = `# ${page.title}\n\n${page.description ? `> ${page.description}\n\n` : ""}`;
  return `${`${head}${body}`.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

// public/docs/*.md (and public/docs.md for /docs itself).
const OUT = new URL("docs/", PUBLIC);
await rm(OUT, { recursive: true, force: true });
const markdown = new Map<Page, string>();
for (const page of pages) {
  const text = await toMarkdown(page);
  markdown.set(page, text);
  const file = new URL(`.${href(page.slug)}.md`, PUBLIC);
  await mkdir(new URL("./", file), { recursive: true });
  await writeFile(file, text);
}

// llms.txt: the map.
const entry = (p: Page) =>
  `- [${p.title}](${mdUrl(p.slug)})${p.description ? `: ${p.description}` : ""}`;
const llms = [
  `# ${site.name}`,
  `> ${site.description}`,
  [
    `Cladux is a React component library you copy into your project, like shadcn/ui. Install components with \`${CLI} add <name>\`; they arrive as source files you own.`,
    "Every component comes in two styles: Tailwind v4 classes, or plain CSS files with `cl-*` class names.",
    `Each link below is the page as Markdown. Every page is also in one file at ${URL_BASE}/llms-full.txt.`,
  ].join(" "),
  "## Docs",
  pages
    .filter((p) => group(p) === "")
    .map(entry)
    .join("\n"),
  "## Components",
  components.map(entry).join("\n"),
  "## Optional",
  [
    `- [Registry index](${URL_BASE}/r/index.json): every installable item as JSON`,
    `- [Source](https://github.com/Killer88967/cladux): the monorepo, with the components in packages/ui`,
  ].join("\n"),
].join("\n\n");
await writeFile(new URL("llms.txt", PUBLIC), `${llms}\n`);

// llms-full.txt: everything.
await writeFile(new URL("llms-full.txt", PUBLIC), `${[...markdown.values()].join("\n---\n\n")}`);

console.log(`llms: ${pages.length} pages`);
