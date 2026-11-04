import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_REGISTRY, type Config } from "./config.ts";
import { CliError } from "./ui.ts";

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
  namespace?: string;
}

export type RegistrySource = string | { url: string; headers?: Record<string, string> };

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
export async function loadText(source: RegistrySource, file: string): Promise<string> {
  const { url: registry, headers } = typeof source === "string" ? { url: source } : source;
  if (/^https?:\/\//.test(registry)) {
    const url = `${registry.replace(/\/$/, "")}/${file}`;
    let res: Response;
    try {
      res = await fetch(url, { headers });
    } catch (error) {
      throw new Error(`Couldn't reach the registry at ${url} (${(error as Error).message})`);
    }
    if (res.status === 404) throw new NotFoundError(file);
    if (res.status === 401 || res.status === 403) {
      throw new CliError(
        `${registry} refused access (${res.status}). Check its headers in cl.json.`,
      );
    }
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

const load = async <T>(registry: RegistrySource, file: string) =>
  JSON.parse(await loadText(registry, file)) as T;

export class NotFoundError extends Error {
  constructor(file: string) {
    super(`"${file}" isn't in the registry`);
  }
}

export const fetchIndex = (registry: RegistrySource) => load<RegistryIndex>(registry, "index.json");

/** A component's docs page as Markdown. */
export const fetchDocs = (registry: RegistrySource, name: string) =>
  loadText(registry, `docs/${name}.md`);

export const fetchItem = (registry: RegistrySource, style: string, name: string) =>
  load<RegistryItem>(registry, `${style}/${name}.json`);

type RegistryConfig = Pick<Config, "registry" | "registries">;

/** "@acme/button" -> "button" in the registry named \@acme; "button" -> the default registry. */
export function locate(config: RegistryConfig, spec: string, from?: string) {
  const match = /^(@[a-z0-9-]+)\/(.+)$/.exec(spec);
  const namespace = match?.[1] ?? from;
  const name = match?.[2] ?? spec;
  if (!namespace) return { name, source: config.registry as RegistrySource };

  const entry =
    config.registries?.[namespace] ?? (namespace === "@cladux" ? DEFAULT_REGISTRY : undefined);
  if (!entry)
    throw new CliError(`Unknown registry ${namespace}. Add it to "registries" in cl.json.`);
  // ${TOKEN} comes from the environment, so secrets stay out of cl.json.
  const expand = (value: string) =>
    value.replace(/\$\{(\w+)\}/g, (_, variable: string) => {
      const set = process.env[variable];
      if (set === undefined) throw new CliError(`${namespace} needs ${variable}, which isn't set.`);
      return set;
    });
  const { url, headers = {} } = typeof entry === "string" ? { url: entry } : entry;
  const source = {
    url: expand(url),
    headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, expand(v)])),
  };
  return { namespace, name, source };
}

/** The name to show and to match against what was asked for: "button" or "@acme/button". */
export const qualified = (item: { name: string; namespace?: string }) =>
  item.namespace ? `${item.namespace}/${item.name}` : item.name;

/** Fetches one item by the name people type, from whichever registry it names. */
export async function fetchNamed(config: RegistryConfig, style: string, spec: string) {
  const { namespace, name, source } = locate(config, spec);
  const item = await fetchItem(source, style, name);
  return namespace ? { ...item, namespace } : item;
}

/**
 * Fetches the named items and everything they depend on, dependencies first,
 * each item once. A plain dependency comes from the same registry as the item
 * that needs it; "@acme/button" comes from @acme.
 */
export async function resolveItems(config: RegistryConfig, style: string, names: string[]) {
  const ordered: RegistryItem[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();

  const visit = async (spec: string, from?: string) => {
    const { namespace, name, source } = locate(config, spec, from);
    const key = qualified({ name, namespace });
    if (done.has(key) || visiting.has(key)) return;
    visiting.add(key);
    const fetched = await fetchItem(source, style, name);
    const item = namespace ? { ...fetched, namespace } : fetched;
    for (const dep of item.registryDependencies) await visit(dep, namespace);
    visiting.delete(key);
    done.add(key);
    ordered.push(item);
  };

  for (const name of names) await visit(name);
  return ordered;
}
