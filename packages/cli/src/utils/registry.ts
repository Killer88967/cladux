import { readFile } from "node:fs/promises";
import path from "node:path";

export interface RegistryFile {
  path: string;
  type: "ui" | "hook" | "lib" | "css";
  content: string;
}

export interface RegistryItem {
  name: string;
  type: "registry:ui" | "registry:block" | "registry:hook" | "registry:lib" | "registry:style";
  style: string;
  description?: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

export interface RegistryIndex {
  styles: string[];
  /** The import paths the files are written with. */
  aliases?: { components: string; hooks: string; lib: string; utils: string };
  items: {
    name: string;
    type: string;
    description?: string;
    new?: boolean;
    registryDependencies: string[];
  }[];
}

/** Reads a registry file from a URL, or from a folder (handy for local testing). */
export async function loadText(registry: string, file: string): Promise<string> {
  if (/^https?:\/\//.test(registry)) {
    const url = `${registry.replace(/\/$/, "")}/${file}`;
    let res: Response;
    try {
      res = await fetch(url);
    } catch (error) {
      throw new Error(`Couldn't reach the registry at ${url} (${(error as Error).message})`);
    }
    if (res.status === 404) throw new NotFoundError(file);
    if (!res.ok) throw new Error(`Registry returned ${res.status} for ${url}`);
    return res.text();
  }
  try {
    return await readFile(path.resolve(registry, file), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new NotFoundError(file);
    throw error;
  }
}

const load = async <T>(registry: string, file: string) =>
  JSON.parse(await loadText(registry, file)) as T;

export class NotFoundError extends Error {
  constructor(file: string) {
    super(`"${file}" isn't in the registry`);
  }
}

export const fetchIndex = (registry: string) => load<RegistryIndex>(registry, "index.json");

/** A component's docs page as Markdown. */
export const fetchDocs = (registry: string, name: string) => loadText(registry, `docs/${name}.md`);

export const fetchItem = (registry: string, style: string, name: string) =>
  load<RegistryItem>(registry, `${style}/${name}.json`);

/**
 * Fetches the named items and everything they depend on, dependencies first,
 * each item once.
 */
export async function resolveItems(registry: string, style: string, names: string[]) {
  const ordered: RegistryItem[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();

  const visit = async (name: string) => {
    if (done.has(name) || visiting.has(name)) return;
    visiting.add(name);
    const item = await fetchItem(registry, style, name);
    for (const dep of item.registryDependencies) await visit(dep);
    visiting.delete(name);
    done.add(name);
    ordered.push(item);
  };

  for (const name of names) await visit(name);
  return ordered;
}
