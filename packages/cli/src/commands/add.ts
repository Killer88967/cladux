import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import { CONFIG_FILE, readConfig } from "../utils/config.ts";
import { addImport } from "../utils/css.ts";
import { detectProject } from "../utils/detect.ts";
import { targetPath, writeItemFiles } from "../utils/files.ts";
import { install, missingDeps } from "../utils/install.ts";
import { fetchIndex, NotFoundError, resolveItems, type RegistryItem } from "../utils/registry.ts";
import { findPathAlias } from "../utils/tsconfig.ts";
import { answer, CliError } from "../utils/ui.ts";

export interface AddOptions {
  cwd: string;
  names: string[];
  yes: boolean;
  all: boolean;
  overwrite: boolean;
  skipInstall: boolean;
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
  const unknown = names.filter((n) => !known.has(n));
  if (unknown.length) {
    const hints = unknown.map((n) => {
      const close = closest(
        n,
        components.map((c) => c.name),
      );
      return close ? `"${n}" (did you mean ${close}?)` : `"${n}"`;
    });
    throw new CliError(`Not in the registry: ${hints.join(", ")}`);
  }

  // 2. Fetch them and everything they need.
  const spin = p.spinner();
  spin.start("Fetching from the registry");
  let items: RegistryItem[];
  try {
    items = (await resolveItems(config.registry, config.style, names)).filter(
      (i) => i.type !== "registry:style",
    );
  } catch (error) {
    spin.stop("Fetch failed");
    if (error instanceof NotFoundError) throw new CliError(error.message);
    throw error;
  }
  spin.stop(`Fetched ${items.length} item${items.length === 1 ? "" : "s"}`);

  // 3. Write. What you asked for may replace existing files (with a yes);
  //    dependencies that already exist are left alone so your edits survive.
  const requested = new Set(names);
  const written: string[] = [];
  const skipped: string[] = [];
  const cssFiles: string[] = [];

  for (const item of items) {
    const existing = item.files.filter((f) => existsSync(targetPath(root, alias, config, item, f)));
    // --overwrite (or a yes) only replaces what you named, never its dependencies.
    let overwrite = opts.overwrite && requested.has(item.name);
    if (!overwrite && existing.length && requested.has(item.name) && !opts.yes) {
      overwrite = answer(
        await p.confirm({
          message: `${item.name} is already installed. Overwrite it?`,
          initialValue: false,
        }),
      );
    }

    const res = await writeItemFiles(root, alias, config, item, { overwrite });
    written.push(...res.written);
    // Only mention skipped files for what you asked for; existing dependencies are expected.
    if (requested.has(item.name)) skipped.push(...res.skipped);
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

  const first = items.find((i) => requested.has(i.name) && i.type === "registry:ui");
  p.outro(
    first ? `Done. Use it with:\n  ${importLine(first, config.aliases.components)}` : "Done.",
  );
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
function importLine(item: RegistryItem, componentsAlias: string) {
  // input-otp -> InputOTP: match function names case-insensitively, ignoring dashes.
  const wanted = item.name.replaceAll("-", "").toLowerCase();
  const content = item.files[0]?.content ?? "";
  const name =
    [...content.matchAll(/\bfunction (\w+)/g)]
      .map((m) => m[1]!)
      .find((n) => n.toLowerCase() === wanted) ?? "...";
  return `import { ${name} } from "${componentsAlias}/${item.name}"`;
}
