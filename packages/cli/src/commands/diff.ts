import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { createTwoFilesPatch } from "diff";
import { CONFIG_FILE, readConfig, type Config } from "../utils/config.ts";
import { rewriteImports, targetPath } from "../utils/files.ts";
import { installedCheck } from "../utils/installed.ts";
import {
  fetchIndex,
  fetchNamed,
  NotFoundError,
  qualified,
  type RegistryItem,
} from "../utils/registry.ts";
import { findPathAlias, type PathAlias } from "../utils/tsconfig.ts";
import { CliError } from "../utils/ui.ts";

export interface DiffOptions {
  cwd: string;
  names: string[];
}

/**
 * Compares your files with the registry. With names, prints the changes;
 * without, lists every installed item that's different.
 */
export async function diff(opts: DiffOptions) {
  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  if (!config) throw new CliError(`No ${CONFIG_FILE} here. Run init first.`);
  const alias = await findPathAlias(root);
  if (!alias) throw new CliError("Couldn't find the import alias in tsconfig.json anymore.");

  const summary = !opts.names.length;
  let names = opts.names;
  if (summary) {
    const installed = await installedCheck(root, config);
    const index = await fetchIndex(config.registry);
    names = index.items
      .filter((i) => (i.type === "registry:ui" || i.type === "registry:block") && installed?.(i))
      .map((i) => i.name);
    if (!names.length) return console.log("Nothing installed yet.");
  }

  // Fetch in parallel, report in order.
  const items = await Promise.all(
    names.map((name) =>
      fetchNamed(config, config.style, name).catch((error: unknown) => {
        if (error instanceof NotFoundError) {
          throw new CliError(`"${name}" isn't in the registry. Try: cladux search ${name}`);
        }
        throw error;
      }),
    ),
  );

  const changed: string[] = [];
  for (const item of items) {
    if (!item.files.some((f) => existsSync(targetPath(root, alias, config, item, f)))) {
      console.log(`${qualified(item)} isn't installed. Add it with: cladux add ${qualified(item)}`);
      continue;
    }
    const patches = await itemPatches(root, alias, config, item);
    if (!patches.length) continue;
    changed.push(`${qualified(item)} (${patches.length} file${patches.length === 1 ? "" : "s"})`);
    if (!summary) patches.forEach(printPatch);
  }

  if (!changed.length) {
    console.log(
      summary ? "Everything matches the registry." : "No changes: it matches the registry.",
    );
  } else if (summary) {
    console.log(`Different from the registry:\n  ${changed.join("\n  ")}`);
    console.log("\nSee the changes with: cladux diff <name>");
  }
}

/** One patch per file that differs, from your copy to the registry's. */
async function itemPatches(root: string, alias: PathAlias, config: Config, item: RegistryItem) {
  const patches: string[] = [];
  for (const file of item.files) {
    const dest = targetPath(root, alias, config, item, file);
    const rel = path.relative(root, dest).split(path.sep).join("/");
    const yours = existsSync(dest) ? normalize(await readFile(dest, "utf8")) : "";
    // The registry's copy, with your aliases, as add would write it.
    const theirs = normalize(
      file.type === "css" ? file.content : rewriteImports(file.content, config),
    );
    if (yours === theirs) continue;
    patches.push(createTwoFilesPatch(`yours/${rel}`, `registry/${rel}`, yours, theirs));
  }
  return patches;
}

/** Line endings and the final newline don't count as changes. */
const normalize = (text: string) => `${text.replaceAll("\r\n", "\n").trimEnd()}\n`;

export function printPatch(patch: string) {
  // Skip the "=====" line jsdiff puts first.
  for (const line of patch.split("\n").slice(1)) {
    if (line.startsWith("+++") || line.startsWith("---")) console.log(styleText("bold", line));
    else if (line.startsWith("+")) console.log(styleText("green", line));
    else if (line.startsWith("-")) console.log(styleText("red", line));
    else if (line.startsWith("@@")) console.log(styleText("cyan", line));
    else console.log(line);
  }
}
