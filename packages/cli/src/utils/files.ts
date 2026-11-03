import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { REGISTRY_ALIASES, type Config } from "./config.ts";
import { fingerprint, lockKey, recordFiles } from "./lock.ts";
import type { RegistryFile, RegistryItem } from "./registry.ts";
import { aliasToPath, type PathAlias } from "./tsconfig.ts";

/** Swaps the registry's default import aliases for the ones in cl.json. */
export function rewriteImports(content: string, config: Config) {
  const pairs: [string, string][] = [
    // utils first: it sits under lib/, so it has to win over the lib rule.
    [`"${REGISTRY_ALIASES.utils}"`, `"${config.aliases.utils}"`],
    [`"${REGISTRY_ALIASES.components}/`, `"${config.aliases.components}/`],
    [`"${REGISTRY_ALIASES.hooks}/`, `"${config.aliases.hooks}/`],
    [`"${REGISTRY_ALIASES.lib}/`, `"${config.aliases.lib}/`],
  ];
  return content.replace(/"@\/[^"]*"/g, (spec) => {
    for (const [from, to] of pairs) {
      if (spec.startsWith(from)) return to + spec.slice(from.length);
    }
    return spec;
  });
}

/** A file's content as it's written to the project: CSS as is, code with your aliases. */
export const fileContent = (file: RegistryFile, config: Config) =>
  file.type === "css" ? file.content : rewriteImports(file.content, config);

/** Where a registry file lands in the user's project. */
export function targetPath(
  root: string,
  alias: PathAlias,
  config: Config,
  item: RegistryItem,
  file: RegistryFile,
  dir?: string,
) {
  if (dir && file.type !== "css") return path.join(dir, path.basename(file.path));
  // The cn() helper goes wherever aliases.utils points.
  if (item.name === "utils")
    return `${aliasToPath(root, alias, config.aliases.utils)}${path.extname(file.path)}`;
  const dirs = {
    ui: () => aliasToPath(root, alias, config.aliases.components),
    hook: () => aliasToPath(root, alias, config.aliases.hooks),
    lib: () => aliasToPath(root, alias, config.aliases.lib),
    css: () => path.join(root, config.css.dir),
  };
  return path.join(dirs[file.type](), file.path);
}

export interface WriteResult {
  written: string[];
  skipped: string[];
}

/** Writes an item's files. Existing files are kept unless `overwrite` is set. */
export async function writeItemFiles(
  root: string,
  alias: PathAlias,
  config: Config,
  item: RegistryItem,
  { overwrite = false, dir }: { overwrite?: boolean; dir?: string } = {},
): Promise<WriteResult> {
  const result: WriteResult = { written: [], skipped: [] };
  const fingerprints: Record<string, string> = {};
  for (const file of item.files) {
    const dest = targetPath(root, alias, config, item, file, dir);
    const rel = path.relative(root, dest);
    if (existsSync(dest) && !overwrite) {
      result.skipped.push(rel);
      continue;
    }
    await mkdir(path.dirname(dest), { recursive: true });
    const content = fileContent(file, config);
    await writeFile(dest, content);
    fingerprints[lockKey(root, dest)] = fingerprint(content);
    result.written.push(rel);
  }
  await recordFiles(root, fingerprints);
  return result;
}
