import { existsSync } from "node:fs";
import path from "node:path";
import type { Config } from "./config.ts";
import { aliasToPath, findPathAlias } from "./tsconfig.ts";

/**
 * Tells whether a component or block is in the project, by its main file.
 * null outside a project (no cl.json, or no import alias).
 */
export async function installedCheck(root: string, config: Config | null) {
  const alias = config ? await findPathAlias(root) : null;
  if (!config || !alias) return null;
  const dir = aliasToPath(root, alias, config.aliases.components);
  return (item: { name: string; type: string }) =>
    existsSync(path.join(dir, item.type === "registry:block" ? "blocks" : "", `${item.name}.tsx`));
}
