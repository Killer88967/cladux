import { existsSync, statSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Tailwind } from "@cladux/css-style";
import * as p from "@clack/prompts";
import { readConfig, REGISTRY_ALIASES } from "../utils/config.ts";
import { allDeps, readPackageJson } from "../utils/detect.ts";
import { lockKey, readLock } from "../utils/lock.ts";
import type { RegistryFile, RegistryItem } from "../utils/registry.ts";
import { sourceIssues } from "../utils/schema.ts";
import { aliasToPath, findPathAlias } from "../utils/tsconfig.ts";
import { CliError } from "../utils/ui.ts";
import { packageName, PROVIDED, validateRegistry } from "../utils/validate.ts";

/** The file `build` reads: your items and their files. */
export const SOURCE_FILE = "cl-registry.json";

const SCHEMA = "https://cladux.vercel.app/schema";

interface SourceItem {
  name: string;
  type?: RegistryItem["type"];
  description?: string;
  new?: boolean;
  files: (string | { path: string; type?: RegistryFile["type"] })[];
  docs?: string;
}

interface Source {
  style?: string;
  css?: boolean;
  stylesheet?: string;
  output?: string;
  items: SourceItem[];
}

export interface BuildOptions {
  cwd: string;
  /** Path to the source file. Defaults to cl-registry.json. */
  source?: string;
  /** @tailwindcss/node to use instead of the project's own (for tests). */
  tailwind?: Tailwind;
}

const FILE_TYPE: Record<RegistryItem["type"], RegistryFile["type"]> = {
  "registry:ui": "ui",
  "registry:block": "ui",
  "registry:hook": "hook",
  "registry:lib": "lib",
  "registry:style": "css",
};

/** Where each file type is imported from in a registry. */
const ALIAS: Record<Exclude<RegistryFile["type"], "css">, string> = {
  ui: REGISTRY_ALIASES.components,
  hook: REGISTRY_ALIASES.hooks,
  lib: REGISTRY_ALIASES.lib,
};

const EXTENSIONS = ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
const isFile = (file: string) => existsSync(file) && statSync(file).isFile();
const withoutExtension = (file: string) => file.replace(/\.[jt]sx?$/, "");

/**
 * `cladux build`: turns your own components into a registry other projects
 * can install from. Dependencies come from the imports: another item's file
 * becomes a registry dependency, a Cladux component you installed becomes
 * \@cladux/\<name>, and a package becomes an npm dependency at the version in
 * your package.json.
 */
export async function build(opts: BuildOptions) {
  const root = path.resolve(opts.cwd);
  const sourcePath = path.resolve(root, opts.source ?? SOURCE_FILE);
  if (!existsSync(sourcePath)) {
    throw new CliError(
      `No ${path.basename(sourcePath)} here. See: cladux docs, or /docs/cli#build`,
    );
  }
  let source: Source;
  try {
    source = JSON.parse(await readFile(sourcePath, "utf8"));
  } catch (error) {
    throw new CliError(
      `${path.basename(sourcePath)} isn't valid JSON: ${(error as Error).message}`,
    );
  }
  const issues = sourceIssues(source);
  if (issues.length) {
    throw new CliError(
      `${path.basename(sourcePath)} has problems:\n${issues.map((m) => `  ${m}`).join("\n")}`,
    );
  }

  p.intro("Cladux");
  const alias = await findPathAlias(root);
  const config = await readConfig(root);
  // Your files are written in your project's style, unless cl-registry.json says otherwise.
  const style = source.style ?? config?.style ?? "tailwind";
  const out = path.resolve(root, source.output ?? "public/r");
  const lock = await readLock(root);
  const versions = existsSync(path.join(root, "package.json"))
    ? allDeps(await readPackageJson(root))
    : {};
  const rel = (file: string) => path.relative(root, file).split(path.sep).join("/");
  const problems: string[] = [];

  // 1. Every listed file: which item it belongs to, and where it lands.
  const owners = new Map<string, { item: string; type: RegistryFile["type"]; target: string }>();
  const plan = source.items.map((item) => {
    const type = item.type ?? "registry:ui";
    const files = item.files.map((entry) => {
      const { path: file, type: fileType } = typeof entry === "string" ? { path: entry } : entry;
      const abs = path.resolve(root, file);
      const kind = fileType ?? (file.endsWith(".css") ? "css" : FILE_TYPE[type]);
      // Blocks go in their own folder, as Cladux's do.
      const target = `${type === "registry:block" && kind === "ui" ? "blocks/" : ""}${path.basename(file)}`;
      if (!isFile(abs)) problems.push(`${item.name}: ${file} doesn't exist`);
      else if (owners.has(abs))
        problems.push(`${file} is in both ${owners.get(abs)!.item} and ${item.name}`);
      else owners.set(abs, { item: item.name, type: kind, target });
      return { abs, kind, target };
    });
    return { item, type, files };
  });
  if (problems.length) throw new CliError(problems.join("\n"));

  /** A Cladux file this project installed (it's in cl-lock.json): its name and registry import. */
  const cladux = (file: string) => {
    if (!config || !alias || !lock.files[lockKey(root, file)]) return null;
    const utils = aliasToPath(root, alias, config.aliases.utils);
    if (withoutExtension(file) === utils) return { name: "utils", spec: REGISTRY_ALIASES.utils };
    for (const [key, base] of [
      ["components", REGISTRY_ALIASES.components],
      ["hooks", REGISTRY_ALIASES.hooks],
      ["lib", REGISTRY_ALIASES.lib],
    ] as const) {
      const inside = path.relative(aliasToPath(root, alias, config.aliases[key]), file);
      if (inside.startsWith("..") || path.isAbsolute(inside)) continue;
      const sub = withoutExtension(inside.split(path.sep).join("/"));
      return { name: sub.split("/").at(-1)!, spec: `${base}/${sub}` };
    }
    return null;
  };

  /** The project file an import points at, or "missing" for a local path that isn't there. */
  const resolve = (spec: string, from: string) => {
    let base: string | null = null;
    if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
    else if (alias && (spec === alias.prefix || spec.startsWith(`${alias.prefix}/`))) {
      base = path.join(root, alias.dir, spec.slice(alias.prefix.length));
    }
    if (base === null) return null;
    return EXTENSIONS.map((ext) => base + ext).find(isFile) ?? "missing";
  };

  // 2. Read each file, point its imports at the registry's aliases, collect dependencies.
  const items: RegistryItem[] = [];
  for (const { item, type, files } of plan) {
    const dependencies = new Set<string>();
    const registryDependencies = new Set<string>();
    const registryFiles: RegistryFile[] = [];

    for (const { abs, kind, target } of files) {
      let content = await readFile(abs, "utf8");
      if (kind !== "css") {
        content = content.replace(
          /(\bfrom\s+|\bimport\s+|\bimport\()(["'])([^"']+)\2/g,
          (whole, lead: string, quote: string, spec: string) => {
            const to = (next: string) => `${lead}${quote}${next}${quote}`;
            const file = resolve(spec, abs);
            if (file === "missing") {
              problems.push(`${rel(abs)} imports ${spec}, which doesn't exist`);
              return whole;
            }
            if (file) {
              const owner = owners.get(file);
              if (owner && owner.type !== "css") {
                if (owner.item !== item.name) registryDependencies.add(owner.item);
                return to(`${ALIAS[owner.type]}/${withoutExtension(owner.target)}`);
              }
              const installed = cladux(file);
              if (installed) {
                registryDependencies.add(`@cladux/${installed.name}`);
                return to(installed.spec);
              }
              problems.push(
                `${rel(abs)} imports ${spec}, which isn't in any item. Add ${rel(file)} to ${SOURCE_FILE}.`,
              );
              return whole;
            }
            // A package: record it with the version range from package.json.
            const name = packageName(spec);
            if (spec.startsWith("node:") || PROVIDED.has(name)) return whole;
            const range = versions[name];
            if (range) dependencies.add(`${name}@${range}`);
            else problems.push(`${rel(abs)} imports ${name}, which isn't in package.json`);
            return whole;
          },
        );
      }
      registryFiles.push({ path: target, type: kind, content });
    }

    items.push({
      name: item.name,
      type,
      style,
      ...(item.description ? { description: item.description } : {}),
      ...(item.new ? { new: true } : {}),
      dependencies: [...dependencies].sort(),
      registryDependencies: [...registryDependencies].sort(),
      files: registryFiles,
    });
  }
  if (problems.length) throw new CliError([...new Set(problems)].join("\n"));

  // 3. The plain-CSS style, generated from the Tailwind files, as Cladux's own is.
  const styles = new Map([[style, items]]);
  if (style === "tailwind" && source.css !== false) {
    const stylesheet = source.stylesheet ?? config?.css.globals;
    if (!stylesheet) {
      throw new CliError(
        `Which stylesheet are your components styled with? Set "stylesheet" in ${SOURCE_FILE}, or "css": false to skip the css style.`,
      );
    }
    const spin = p.spinner();
    spin.start("Building the css style");
    try {
      const tailwind = opts.tailwind ?? (await loadTailwind(root));
      styles.set("css", await cssItems(items, path.resolve(root, stylesheet), tailwind));
      spin.stop("Built the css style");
    } catch (error) {
      spin.stop("The css style failed");
      throw error;
    }
  }

  // 4. Write: the old item files go first, so nothing stale is left behind.
  for (const [name, list] of styles) {
    const styleDir = path.join(out, name);
    await mkdir(styleDir, { recursive: true });
    for (const file of await readdir(styleDir)) {
      if (file.endsWith(".json")) await rm(path.join(styleDir, file));
    }
    for (const item of list) {
      const json = { $schema: `${SCHEMA}/registry-item.json`, ...item };
      await writeFile(
        path.join(styleDir, `${item.name}.json`),
        `${JSON.stringify(json, null, 2)}\n`,
      );
    }
  }
  for (const item of source.items) {
    if (!item.docs) continue;
    await mkdir(path.join(out, "docs"), { recursive: true });
    await copyFile(path.resolve(root, item.docs), path.join(out, "docs", `${item.name}.md`));
  }
  const index = {
    $schema: `${SCHEMA}/registry.json`,
    styles: [...styles.keys()],
    aliases: REGISTRY_ALIASES,
    items: items.map(({ name, type, description, new: isNew, registryDependencies }) => ({
      name,
      type,
      ...(description ? { description } : {}),
      ...(isNew ? { new: true } : {}),
      registryDependencies,
    })),
  };
  await writeFile(path.join(out, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  p.log.success(
    `Built ${items.length} item${items.length === 1 ? "" : "s"} into ${rel(out)}, in ${[...styles.keys()].join(" and ")}`,
  );

  // 5. The same checks `registry validate` runs.
  const { issues: found } = await validateRegistry(out);
  for (const issue of found) p.log.warn(`${issue.file}: ${issue.message}`);
  if (found.some((i) => i.level === "error")) throw new CliError("The registry has errors.");

  p.outro(
    `Done. Publish ${rel(out)}, then others can add your items:\n` +
      `  "registries": { "@you": "https://your-site.com/${rel(out).replace(/^public\//, "")}" }\n` +
      `  cladux add @you/${items[0]!.name}`,
  );
}

/**
 * Loads Tailwind's compiler from the project, the way its own build finds it:
 * directly, or through @tailwindcss/postcss, /vite or /cli.
 */
async function loadTailwind(root: string): Promise<Tailwind> {
  const require = createRequire(path.join(root, "package.json"));
  for (const via of ["", "@tailwindcss/postcss", "@tailwindcss/vite", "@tailwindcss/cli"]) {
    try {
      const from = via ? createRequire(require.resolve(via)) : require;
      return await import(pathToFileURL(from.resolve("@tailwindcss/node")).href);
    } catch {
      // Try the next way in.
    }
  }
  throw new CliError(
    `Building the css style needs Tailwind v4's compiler. Install it with: npm i -D @tailwindcss/node\n` +
      `Or set "css": false in ${SOURCE_FILE} to build only the Tailwind style.`,
  );
}

/**
 * The css style of each item: the same files with readable `cl-*` classes, plus
 * one stylesheet per item, generated by the converter Cladux's registry uses.
 */
async function cssItems(items: RegistryItem[], stylesheet: string, tailwind: Tailwind) {
  if (!isFile(stylesheet)) throw new CliError(`The stylesheet ${stylesheet} doesn't exist.`);
  // Loaded here, so the other commands don't pay for the converter.
  const { buildCssStyle, unknown } = await import("@cladux/css-style");
  const css = await readFile(stylesheet, "utf8");
  const base = path.dirname(stylesheet);

  // One source per code file, named after it, as Cladux names its components.
  const sources = new Map<string, string>();
  for (const item of items) {
    for (const file of item.files) {
      if (file.type !== "css")
        sources.set(path.basename(withoutExtension(file.path)), file.content);
    }
  }
  // The theme variables the project defines, so they get the --cl- prefix the css style uses.
  const compiled = await tailwind.compile(css, { base, onDependency() {} });
  let result: Awaited<ReturnType<typeof buildCssStyle>>;
  try {
    result = await buildCssStyle(sources, { css, base, tailwind, tokens: compiled.build([]) });
  } catch (error) {
    throw new CliError(`Couldn't build the css style: ${(error as Error).message}`);
  }
  if (unknown.size)
    p.log.warn(`Kept as they are (not Tailwind classes):\n  ${[...unknown].join("\n  ")}`);

  return items.map((item): RegistryItem => {
    const name = (file: RegistryFile) => path.basename(withoutExtension(file.path));
    const sheet = item.files
      .filter((f) => f.type !== "css")
      .map((f) => result.css.get(name(f)))
      .filter(Boolean)
      .join("\n");
    return {
      ...item,
      style: "css",
      files: [
        ...item.files.map((f) =>
          f.type === "css" ? f : { ...f, content: result.files.get(name(f)) ?? f.content },
        ),
        ...(sheet ? [{ path: `${item.name}.css`, type: "css" as const, content: sheet }] : []),
      ],
    };
  });
}
