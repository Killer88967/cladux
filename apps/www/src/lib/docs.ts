import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

export interface DocMeta {
  title: string;
  description?: string;
  /** Sort position inside its sidebar group. Docs without one sort by title after the rest. */
  order?: number;
  /** Shows a "New" badge in the sidebar and on /docs/components. */
  new?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  isNew?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Sidebar groups, in display order. A doc's group is its first folder. */
const GROUPS: Record<string, string> = {
  "": "Getting Started",
  components: "Components",
};

/** Every doc as a slug array; `index.mdx` files map to their folder. */
export async function getDocSlugs(): Promise<string[][]> {
  const files = await readdir(DOCS_DIR, { recursive: true });

  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, "").split(path.sep))
    .map((parts) => (parts.at(-1) === "index" ? parts.slice(0, -1) : parts));
}

/**
 * A doc's metadata, read from the file instead of importing it. Importing would
 * make every page that shows the nav (all of them, through the header) bundle
 * every doc, with every demo the docs show.
 */
export async function getMeta(slug: string[]): Promise<DocMeta | null> {
  const base = slug.join("/");
  for (const file of base ? [base, `${base}/index`] : ["index"]) {
    const source = await readFile(path.join(DOCS_DIR, `${file}.mdx`), "utf8").catch(() => null);
    if (source === null) continue;
    // The metadata is our own JS object literal, so evaluate it instead of parsing it.
    const block = /^export const metadata = (\{[\s\S]*?\n\});\n/m.exec(source);
    return block ? (new Function(`return ${block[1]}`)() as DocMeta) : null;
  }
  return null;
}

export async function getNav(): Promise<NavGroup[]> {
  const groups = new Map<string, (NavItem & { order: number })[]>();

  for (const slug of await getDocSlugs()) {
    const meta = await getMeta(slug);
    if (!meta) continue;

    const key = slug.length > 1 ? slug[0]! : "";
    const items = groups.get(key) ?? [];
    items.push({
      title: meta.title,
      href: `/docs/${slug.join("/")}`.replace(/\/$/, ""),
      order: meta.order ?? Number.POSITIVE_INFINITY,
      isNew: meta.new,
    });
    groups.set(key, items);
  }

  const keys = Object.keys(GROUPS);
  return [...groups.entries()]
    .sort(([a], [b]) => (keys.indexOf(a) + 1 || 99) - (keys.indexOf(b) + 1 || 99))
    .map(([key, items]) => ({
      title: GROUPS[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
      items: items
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
        .map(({ title, href, isNew }) => ({ title, href, isNew })),
    }));
}

/** The docs before and after `href`, in sidebar order. */
export async function getPager(href: string) {
  const flat = (await getNav()).flatMap((group) => group.items);
  const index = flat.findIndex((item) => item.href === href);

  return {
    prev: index > 0 ? flat[index - 1] : undefined,
    next: index >= 0 ? flat[index + 1] : undefined,
  };
}

/** Pages whose components aren't registry items themselves. */
const INSTALL_FROM: Record<string, { items: string[]; packages?: string }> = {
  "date-picker": { items: ["popover", "calendar"] },
  "data-table": { items: ["table"], packages: "@tanstack/react-table" },
};

export interface InstallInfo {
  /** Registry items for `cladux add`. */
  items: string[];
  /** Extra npm packages the page's examples need. */
  packages?: string;
  /** The heading the Installation section goes before ("Usage", or the first one). */
  before: string;
}

/** What a component page's Installation section shows, or null for other pages. */
export async function getInstall(slug: string[]): Promise<InstallInfo | null> {
  if (slug[0] !== "components" || slug.length !== 2) return null;
  const name = slug[1]!;

  const indexFile = path.join(/* turbopackIgnore: true */ process.cwd(), "public/r/index.json");
  const index = JSON.parse(await readFile(indexFile, "utf8")) as { items: { name: string }[] };
  const items = index.items.some((i) => i.name === name) ? [name] : INSTALL_FROM[name]?.items;
  if (!items) return null;

  const source = await readFile(path.join(DOCS_DIR, `${slug.join("/")}.mdx`), "utf8");
  const headings = [...source.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.replace(/`/g, "").trim());
  const before = headings.includes("Usage") ? "Usage" : headings[0];
  return before ? { items, packages: INSTALL_FROM[name]?.packages, before } : null;
}
