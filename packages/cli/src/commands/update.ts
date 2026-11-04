import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import { CONFIG_FILE, readConfig } from "../utils/config.ts";
import { addImport, relativeImport } from "../utils/css.ts";
import { detectProject } from "../utils/detect.ts";
import { fileContent, targetPath, writeItemFiles } from "../utils/files.ts";
import { installedCheck } from "../utils/installed.ts";
import { install, missingDeps } from "../utils/install.ts";
import { fingerprint, lockKey, normalize, readLock, recordFiles } from "../utils/lock.ts";
import {
  fetchIndex,
  fetchNamed,
  NotFoundError,
  qualified,
  type RegistryFile,
} from "../utils/registry.ts";
import { findPathAlias } from "../utils/tsconfig.ts";
import { CliError } from "../utils/ui.ts";

export interface UpdateOptions {
  cwd: string;
  names: string[];
  force: boolean;
  dryRun: boolean;
  skipInstall: boolean;
}

type Action = "add" | "replace" | "current" | "edited";

/**
 * Brings installed components up to date with the registry. Files you
 * haven't changed are replaced; files you edited are kept unless --force.
 */
export async function update(opts: UpdateOptions) {
  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  if (!config) throw new CliError(`No ${CONFIG_FILE} here. Run init first.`);
  const alias = await findPathAlias(root);
  if (!alias) throw new CliError("Couldn't find the import alias in tsconfig.json anymore.");

  p.intro("Cladux");
  const installed = await installedCheck(root, config);
  const index = await fetchIndex(config.registry);
  let names = opts.names;
  if (!names.length) {
    names = index.items
      .filter((i) => (i.type === "registry:ui" || i.type === "registry:block") && installed?.(i))
      .map((i) => i.name);
    if (!names.length) return p.outro("Nothing installed yet.");
  }

  const spin = p.spinner();
  spin.start("Fetching from the registry");
  const items = await Promise.all(
    names.map((name) =>
      fetchNamed(config, config.style, name).catch((error: unknown) => {
        spin.stop("Fetch failed");
        if (error instanceof NotFoundError) {
          throw new CliError(`"${name}" isn't in the registry. Try: cladux search ${name}`);
        }
        throw error;
      }),
    ),
  );
  spin.stop(`Fetched ${items.length} item${items.length === 1 ? "" : "s"}`);

  // Decide what happens to each file.
  const lock = await readLock(root);
  const plan: { item: (typeof items)[number]; file: RegistryFile; rel: string; action: Action }[] =
    [];
  for (const item of items) {
    if (!installed?.(item)) {
      p.log.warn(`${qualified(item)} isn't installed. Add it with: cladux add ${qualified(item)}`);
      continue;
    }
    for (const file of item.files) {
      const dest = targetPath(root, alias, config, item, file);
      const rel = lockKey(root, dest);
      const yours = existsSync(dest) ? await readFile(dest, "utf8") : null;
      const action: Action =
        yours === null
          ? "add"
          : normalize(yours) === normalize(fileContent(file, config))
            ? "current"
            : opts.force || lock.files[rel] === fingerprint(yours)
              ? "replace"
              : "edited";
      plan.push({ item, file, rel, action });
    }
  }

  const changes = plan.filter((f) => f.action === "add" || f.action === "replace");
  const edited = plan.filter((f) => f.action === "edited");
  if (changes.length) {
    p.log.info(
      `${opts.dryRun ? "Would update" : "Updating"}\n` +
        changes.map((f) => `  ${f.action.padEnd(7)} ${f.rel}`).join("\n"),
    );
  }
  if (edited.length) {
    p.log.warn(
      `Kept, because you changed them\n${edited.map((f) => `  ${f.rel}`).join("\n")}\n` +
        "See what's new with: cladux diff <name>. Replace them with: cladux update <name> --force",
    );
  }
  if (opts.dryRun) return p.outro("Nothing was written.");

  // Write, one item at a time, so the lock gets the new fingerprints.
  for (const item of new Set(changes.map((f) => f.item))) {
    const files = changes.filter((f) => f.item === item).map((f) => f.file);
    await writeItemFiles(root, alias, config, { ...item, files }, { overwrite: true });
  }

  // Up-to-date files from before the lock existed get a fingerprint now.
  const current = plan.filter((f) => f.action === "current" && !lock.files[f.rel]);
  await recordFiles(
    root,
    Object.fromEntries(current.map((f) => [f.rel, fingerprint(fileContent(f.file, config))])),
  );

  // A CSS file that's new for a component goes through cl.css, like in add.
  const newCss = changes.filter((f) => f.action === "add" && f.file.type === "css");
  if (newCss.length) {
    const entryPath = path.join(root, config.css.entry);
    let entry = existsSync(entryPath) ? await readFile(entryPath, "utf8") : "";
    for (const f of newCss)
      entry = addImport(entry, relativeImport(entryPath, path.join(root, f.rel)));
    await mkdir(path.dirname(entryPath), { recursive: true });
    await writeFile(entryPath, entry.endsWith("\n") ? entry : `${entry}\n`);
  }

  // Upstream may have added packages or components these now rely on.
  const deps = await missingDeps(
    root,
    items.flatMap((i) => i.dependencies),
  );
  if (deps.length && !opts.skipInstall) {
    p.log.step(`Installing ${deps.join(", ")}`);
    await install(root, (await detectProject(root)).packageManager, deps);
  } else if (deps.length) {
    p.log.warn(`Skipped installing: ${deps.join(" ")}`);
  }
  const needed = [...new Set(items.flatMap((i) => i.registryDependencies))].filter((name) => {
    const dep = index.items.find((i) => i.name === name);
    return (dep?.type === "registry:ui" || dep?.type === "registry:block") && !installed?.(dep);
  });
  if (needed.length) {
    p.log.warn(
      `These now also need: ${needed.join(", ")}. Add them with: cladux add ${needed.join(" ")}`,
    );
  }

  p.outro(
    changes.length
      ? `Updated ${changes.length} file${changes.length === 1 ? "" : "s"}.`
      : edited.length
        ? "Nothing else to update."
        : "Everything is up to date.",
  );
}
