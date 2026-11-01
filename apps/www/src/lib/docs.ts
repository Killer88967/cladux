import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

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

export async function getDoc(slug: string[]) {
  const base = slug.join("/");
  const candidates = base ? [base, `${base}/index`] : ["index"];

  for (const file of candidates) {
    try {
      const mod = await import(`@/content/docs/${file}.mdx`);
      return { Content: mod.default as ComponentType, metadata: mod.metadata as DocMeta };
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

export async function getNav(): Promise<NavGroup[]> {
  const groups = new Map<string, (NavItem & { order: number })[]>();

  for (const slug of await getDocSlugs()) {
    const doc = await getDoc(slug);
    if (!doc) continue;

    const key = slug.length > 1 ? slug[0]! : "";
    const items = groups.get(key) ?? [];
    items.push({
      title: doc.metadata.title,
      href: `/docs/${slug.join("/")}`.replace(/\/$/, ""),
      order: doc.metadata.order ?? Number.POSITIVE_INFINITY,
      isNew: doc.metadata.new,
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
