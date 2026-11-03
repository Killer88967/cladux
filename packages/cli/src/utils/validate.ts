import { readdir } from "node:fs/promises";
import { builtinModules } from "node:module";
import path from "node:path";
import { REGISTRY_ALIASES, type Aliases } from "./config.ts";
import { loadText, NotFoundError, type RegistryIndex, type RegistryItem } from "./registry.ts";
import { indexIssues, itemIssues } from "./schema.ts";

export interface Issue {
  level: "error" | "warning";
  /** The registry file it's about, such as tailwind/button.json. */
  file: string;
  message: string;
}

// Provided by the app itself, so items don't list them as dependencies.
const PROVIDED = new Set(["react", "react-dom", "next", ...builtinModules]);

/** "@base-ui/react/menu" -> "@base-ui/react", "clsx@^2" -> "clsx" */
const packageName = (spec: string) => {
  const name = spec.replace(/(?!^)@.*$/, "");
  return name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0]!;
};

/**
 * Checks a registry (a URL or a folder) against the schemas, and for what a
 * schema can't see: missing files, unknown or circular dependencies, imports
 * that `add` wouldn't install, and two items writing the same file.
 */
export async function validateRegistry(registry: string) {
  const issues: Issue[] = [];
  const report = (level: Issue["level"], file: string, message: string) =>
    issues.push({ level, file, message });

  let index: RegistryIndex;
  try {
    index = JSON.parse(await loadText(registry, "index.json"));
  } catch (error) {
    report(
      "error",
      "index.json",
      error instanceof NotFoundError
        ? "Not found. A registry needs an index.json at its root."
        : `Can't be read: ${(error as Error).message}`,
    );
    return { issues, checked: 0 };
  }
  for (const message of indexIssues(index)) report("error", "index.json", message);
  if (!Array.isArray(index.styles) || !Array.isArray(index.items)) return { issues, checked: 0 };

  const entries = new Map<string, RegistryIndex["items"][number]>();
  for (const entry of index.items) {
    if (entries.has(entry.name)) report("error", "index.json", `"${entry.name}" is listed twice`);
    entries.set(entry.name, entry);
  }
  for (const entry of index.items) {
    for (const dep of entry.registryDependencies ?? []) {
      if (!entries.has(dep)) {
        report("error", "index.json", `${entry.name} needs "${dep}", which isn't in the registry`);
      }
    }
  }
  const cycle = findCycle(index.items);
  if (cycle) report("error", "index.json", `Circular dependency: ${cycle.join(" -> ")}`);

  const aliases = index.aliases ?? REGISTRY_ALIASES;
  const owners = new Map<string, string>();
  let checked = 0;

  for (const style of index.styles) {
    const items = await Promise.all(
      index.items.map(async (entry) => {
        const file = `${style}/${entry.name}.json`;
        try {
          return { entry, file, item: JSON.parse(await loadText(registry, file)) as RegistryItem };
        } catch (error) {
          report(
            "error",
            file,
            error instanceof NotFoundError
              ? `Missing. index.json lists ${entry.name}, so every style needs this file.`
              : `Can't be read: ${(error as Error).message}`,
          );
          return null;
        }
      }),
    );

    for (const loaded of items) {
      if (!loaded) continue;
      const { entry, file, item } = loaded;
      checked++;
      const problems = itemIssues(item);
      for (const message of problems) report("error", file, message);
      if (problems.length) continue;

      if (item.name !== entry.name) {
        report("error", file, `name is "${item.name}", but index.json calls it "${entry.name}"`);
      }
      if (item.style !== style)
        report("error", file, `style is "${item.style}", but it's in ${style}/`);
      if (item.type !== entry.type) {
        report("error", file, `type is ${item.type}, but index.json says ${entry.type}`);
      }
      if (
        [...item.registryDependencies].sort().join() !==
        [...entry.registryDependencies].sort().join()
      ) {
        report("warning", file, "registryDependencies don't match the ones in index.json");
      }

      for (const f of item.files) {
        const key = `${style}:${f.type}:${f.path}`;
        const owner = owners.get(key);
        if (owner) report("error", file, `${f.path} is also written by ${owner}`);
        else owners.set(key, item.name);
        if (f.type !== "css") {
          for (const message of importIssues(f.content, item, aliases)) {
            report("warning", file, `${f.path}: ${message}`);
          }
        }
      }
    }

    // Files nobody lists (only checkable in a folder: a URL can't be listed).
    if (!/^https?:\/\//.test(registry)) {
      let files: string[] = [];
      try {
        files = await readdir(path.join(registry, style));
      } catch {
        report("error", `${style}/`, `Missing. index.json lists the ${style} style.`);
      }
      for (const name of files) {
        if (name.endsWith(".json") && !entries.has(name.slice(0, -5))) {
          report("warning", `${style}/${name}`, "Not listed in index.json, so `add` can't find it");
        }
      }
    }
  }

  return { issues, checked };
}

/** Imports that would break after `add`: dependencies it wouldn't install, relative paths. */
function importIssues(content: string, item: RegistryItem, aliases: Aliases) {
  const messages: string[] = [];
  const packages = new Set(item.dependencies.map(packageName));
  const needs = new Set(item.registryDependencies);

  for (const [, spec] of content.matchAll(/(?:from\s+|import\s+)"([^"]+)"/g)) {
    if (!spec) continue;
    if (spec === aliases.utils) {
      if (!needs.has("utils"))
        messages.push(`imports ${spec}, but "utils" isn't in registryDependencies`);
      continue;
    }
    const alias = [aliases.components, aliases.hooks, aliases.lib].find((a) =>
      spec.startsWith(`${a}/`),
    );
    if (alias) {
      const name = spec.split("/").at(-1)!;
      if (!needs.has(name)) {
        messages.push(`imports ${spec}, but "${name}" isn't in registryDependencies`);
      }
    } else if (spec.startsWith(".")) {
      messages.push(`imports ${spec}: relative imports break once files are installed`);
    } else if (!spec.startsWith("node:") && !PROVIDED.has(packageName(spec))) {
      if (!packages.has(packageName(spec))) {
        messages.push(`imports ${packageName(spec)}, which isn't in dependencies`);
      }
    }
  }
  return [...new Set(messages)];
}

/** The first circular chain of registryDependencies, if there is one. */
function findCycle(items: RegistryIndex["items"]) {
  const deps = new Map(items.map((i) => [i.name, i.registryDependencies ?? []]));
  const done = new Set<string>();
  const visit = (name: string, trail: string[]): string[] | null => {
    if (trail.includes(name)) return [...trail.slice(trail.indexOf(name)), name];
    if (done.has(name)) return null;
    for (const dep of deps.get(name) ?? []) {
      const cycle = visit(dep, [...trail, name]);
      if (cycle) return cycle;
    }
    done.add(name);
    return null;
  };
  for (const name of deps.keys()) {
    const cycle = visit(name, []);
    if (cycle) return cycle;
  }
  return null;
}
