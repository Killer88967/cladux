import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import * as p from "@clack/prompts";
import { CONFIG_FILE, readConfig, type Config } from "../utils/config.ts";
import { addImport } from "../utils/css.ts";
import { detectProject } from "../utils/detect.ts";
import { rewriteImports, targetPath, writeItemFiles } from "../utils/files.ts";
import { install, missingDeps } from "../utils/install.ts";
import { normalize } from "../utils/lock.ts";
import {
  fetchIndex,
  NotFoundError,
  qualified,
  resolveItems,
  type RegistryItem,
} from "../utils/registry.ts";
import { findPathAlias, pathToAlias, type PathAlias } from "../utils/tsconfig.ts";
import { answer, CliError, spinner } from "../utils/ui.ts";
import { printPatch } from "./diff.ts";
import { createTwoFilesPatch } from "diff";

export interface AddOptions {
  cwd: string;
  names: string[];
  yes: boolean;
  all: boolean;
  overwrite: boolean;
  skipInstall: boolean;
  dryRun: boolean;
  view: boolean;
  diff: boolean;
  path?: string;
}

export async function add(opts: AddOptions) {
  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  if (!config) throw new CliError(`No ${CONFIG_FILE} here. Run init first.`);

  const alias = await findPathAlias(root);
  if (!alias) throw new CliError("Couldn't find the import alias in tsconfig.json anymore.");

  p.intro("Cladux");

  // 1. Which components.
  const index = await fetchIndex(config.registry);
  const components = index.items.filter((i) => i.type === "registry:ui");
  let names = opts.names;

  if (opts.all) {
    names = components.map((c) => c.name);
  } else if (!names.length) {
    if (opts.yes) throw new CliError("Name the components to add, e.g. add button card.");
    names = answer(
      await p.multiselect({
        message: "Which components? (space to select, enter to confirm)",
        options: components.map((c) => ({ value: c.name, label: c.name, hint: c.description })),
        required: true,
      }),
    );
  }

  const known = new Set(index.items.map((i) => i.name));
  const unknown = names.filter((n) => !n.startsWith("@") && !known.has(n));
  if (unknown.length) {
    const hints = unknown.map((n) => {
      // Suggest components and blocks, not hooks or lib files.
      const close = closest(
        n,
        index.items
          .filter((i) => i.type === "registry:ui" || i.type === "registry:block")
          .map((i) => i.name),
      );
      return close ? `"${n}" (did you mean ${close}?)` : `"${n}"`;
    });
    throw new CliError(`Not in the registry: ${hints.join(", ")}`);
  }

  // 2. Fetch them and everything they need.
  const spin = spinner();
  spin.start("Fetching from the registry");
  let items: RegistryItem[];
  try {
    items = (await resolveItems(config, config.style, names)).filter(
      (i) => i.type !== "registry:style",
    );
  } catch (error) {
    spin.stop("Fetch failed");
    if (error instanceof NotFoundError) throw new CliError(error.message);
    throw error;
  }
  spin.stop(`Fetched ${items.length} item${items.length === 1 ? "" : "s"}`);

  // --path moves what you named; its dependencies go where they always do.
  const requested = new Set(names);
  const dir = opts.path ? path.resolve(root, opts.path) : undefined;
  const isRequested = (item: RegistryItem) => requested.has(qualified(item));
  const dirFor = (item: RegistryItem) => (isRequested(item) ? dir : undefined);

  // --dry-run, --view and --diff show what would happen and change nothing.
  if (opts.dryRun || opts.view || opts.diff) {
    return preview(root, alias, config, items, requested, dirFor, opts);
  }

  // 3. Write. What you asked for may replace existing files (with a yes);
  //    dependencies that already exist are left alone so your edits survive.
  const written: string[] = [];
  const skipped: string[] = [];
  const cssFiles: string[] = [];

  for (const item of items) {
    const existing = item.files.filter((f) =>
      existsSync(targetPath(root, alias, config, item, f, dirFor(item))),
    );
    // --overwrite (or a yes) only replaces what you named, never its dependencies.
    let overwrite = opts.overwrite && isRequested(item);
    if (!overwrite && existing.length && isRequested(item) && !opts.yes) {
      overwrite = answer(
        await p.confirm({
          message: `${qualified(item)} is already installed. Overwrite it?`,
          initialValue: false,
        }),
      );
    }

    const res = await writeItemFiles(root, alias, config, item, { overwrite, dir: dirFor(item) });
    written.push(...res.written);
    // Only mention skipped files for what you asked for; existing dependencies are expected.
    if (isRequested(item)) skipped.push(...res.skipped);
    for (const f of item.files) {
      if (f.type === "css") cssFiles.push(path.join(root, config.css.dir, f.path));
    }
  }

  // Component CSS (plain-CSS style) goes through cl.css, so globals never changes.
  if (cssFiles.length) {
    const entryPath = path.join(root, config.css.entry);
    let entry = existsSync(entryPath) ? await readFile(entryPath, "utf8") : "";
    for (const file of cssFiles) {
      const rel = path.relative(path.dirname(entryPath), file).split(path.sep).join("/");
      entry = addImport(entry, rel.startsWith(".") ? rel : `./${rel}`);
    }
    await mkdir(path.dirname(entryPath), { recursive: true });
    await writeFile(entryPath, entry.endsWith("\n") ? entry : `${entry}\n`);
  }

  if (written.length) p.log.success(`Added\n${written.map((f) => `  ${f}`).join("\n")}`);
  if (skipped.length) {
    p.log.info(
      `Already there, left as is\n${skipped.map((f) => `  ${f}`).join("\n")}\n` +
        "Use --overwrite to replace them.",
    );
  }

  // 4. Packages.
  const deps = await missingDeps(
    root,
    items.flatMap((i) => i.dependencies),
  );
  if (deps.length && !opts.skipInstall) {
    p.log.step(`Installing ${deps.join(", ")}`);
    const { packageManager } = await detectProject(root);
    await install(root, packageManager, deps);
  } else if (deps.length) {
    p.log.warn(`Skipped installing: ${deps.join(" ")}`);
  }

  const first = items.find(
    (i) => isRequested(i) && (i.type === "registry:ui" || i.type === "registry:block"),
  );
  // With --path the file sits right in that folder, so import it from there.
  const from = dir ? pathToAlias(root, alias, dir) : config.aliases.components;
  p.outro(
    first && from ? `Done. Use it with:\n  ${importLine(first, from, Boolean(dir))}` : "Done.",
  );
}

/**
 * What add would write and install, without doing it. --view adds the new
 * files' contents, --diff the changes to files that already exist.
 */
async function preview(
  root: string,
  alias: PathAlias,
  config: Config,
  items: RegistryItem[],
  requested: Set<string>,
  dirFor: (item: RegistryItem) => string | undefined,
  opts: AddOptions,
) {
  const files = items.flatMap((item) =>
    item.files.map((file) => {
      const dest = targetPath(root, alias, config, item, file, dirFor(item));
      // Same rule as a real add: only what you named can be replaced.
      const action = !existsSync(dest)
        ? "add"
        : opts.overwrite && requested.has(qualified(item))
          ? "replace"
          : "exists";
      return { file, action, dest, rel: path.relative(root, dest) };
    }),
  );

  p.log.info(`Files\n${files.map((f) => `  ${f.action.padEnd(7)} ${f.rel}`).join("\n")}`);
  if (files.some((f) => f.action === "exists")) {
    p.log.info("Existing files are left as they are. Use --overwrite to replace them.");
  }
  if (files.some((f) => f.file.type === "css" && f.action !== "exists")) {
    p.log.info(`The CSS files would be imported in ${config.css.entry}.`);
  }
  const deps = await missingDeps(
    root,
    items.flatMap((i) => i.dependencies),
  );
  if (deps.length) p.log.info(`Packages to install\n${deps.map((d) => `  ${d}`).join("\n")}`);

  if (opts.view) {
    for (const f of files) {
      if (f.action === "exists") continue;
      const content =
        f.file.type === "css" ? f.file.content : rewriteImports(f.file.content, config);
      console.log(`\n${styleText("cyan", `── ${f.rel}`)}\n${content.trimEnd()}\n`);
    }
  }

  if (opts.diff) {
    for (const f of files) {
      if (f.action === "add") continue;
      const yours = normalize(await readFile(f.dest, "utf8"));
      const theirs = normalize(
        f.file.type === "css" ? f.file.content : rewriteImports(f.file.content, config),
      );
      if (yours !== theirs) {
        const rel = f.rel.split(path.sep).join("/");
        printPatch(createTwoFilesPatch(`yours/${rel}`, `registry/${rel}`, yours, theirs));
      }
    }
  }

  p.outro("Nothing was written.");
}

/** The closest name within two edits, for "did you mean" hints. */
function closest(input: string, names: string[]) {
  let best: string | undefined;
  let bestDistance = 3;
  for (const name of names) {
    const d = distance(input, name);
    if (d < bestDistance) [best, bestDistance] = [name, d];
  }
  return best ?? names.find((n) => n.startsWith(input));
}

/** Levenshtein distance. */
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length]!;
}

/** `import { Button } from "@/components/cl/button"` when the main export is obvious. */
function importLine(item: RegistryItem, componentsAlias: string, flat = false) {
  // input-otp -> InputOTP: match function names case-insensitively, ignoring dashes.
  const wanted = item.name.replaceAll("-", "").toLowerCase();
  const file = item.files.find((f) => f.type === "ui");
  const content = file?.content ?? "";
  const functions = [...content.matchAll(/\bfunction (\w+)/g)].map((m) => m[1]!);
  // A block exports one component; a component file's main export matches its name.
  const name =
    functions.find((n) => n.toLowerCase() === wanted) ??
    (item.type === "registry:block"
      ? /export default function (\w+)/.exec(content)?.[1]
      : undefined) ??
    "...";
  const filePath = file ? (flat ? path.basename(file.path) : file.path) : item.name;
  const from = filePath.replace(/\.tsx?$/, "");
  return item.type === "registry:block"
    ? `import ${name} from "${componentsAlias}/${from}"`
    : `import { ${name} } from "${componentsAlias}/${from}"`;
}
