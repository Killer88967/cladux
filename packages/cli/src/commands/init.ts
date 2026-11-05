import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import {
  CONFIG_FILE,
  DEFAULT_REGISTRY,
  readConfig,
  writeConfig,
  type Config,
} from "../utils/config.ts";
import {
  addImport,
  cssImports,
  definesThemeVariables,
  hasStarterVariables,
  relativeImport,
  removeStarterVariables,
  withoutImports,
} from "../utils/css.ts";
import { detectProject, findGlobalsCss } from "../utils/detect.ts";
import { writeItemFiles } from "../utils/files.ts";
import { install, missingDeps } from "../utils/install.ts";
import { fetchIndex, resolveItems } from "../utils/registry.ts";
import { loadTheme } from "../utils/theme.ts";
import { findPathAlias } from "../utils/tsconfig.ts";
import { answer, CliError, runCommand } from "../utils/ui.ts";

export interface InitOptions {
  cwd: string;
  yes: boolean;
  force: boolean;
  skipInstall: boolean;
  style?: string;
  theme?: string;
  registry?: string;
}

export async function init(opts: InitOptions) {
  const root = path.resolve(opts.cwd);
  if (!existsSync(path.join(root, "package.json"))) {
    throw new CliError(`No package.json in ${root}. Run this from your project's folder.`);
  }

  p.intro("Cladux");

  const previous = await readConfig(root);
  if (previous && !opts.force) {
    if (opts.yes) throw new CliError(`${CONFIG_FILE} already exists. Use --force to overwrite it.`);
    const again = answer(
      await p.confirm({
        message: `${CONFIG_FILE} already exists. Set it up again?`,
        initialValue: false,
      }),
    );
    if (!again) return p.outro("Nothing changed.");
  }

  // 1. Look at the project.
  const info = await detectProject(root);
  if (!info.react)
    throw new CliError("React isn't in package.json. Components need React for now.");
  if (!info.typescript)
    throw new CliError("No tsconfig.json found. Components are TypeScript for now.");
  if (info.tailwind !== null && info.tailwind < 4) {
    throw new CliError(`Tailwind v${info.tailwind} found. Components need Tailwind v4.`);
  }

  const alias = await findPathAlias(root);
  if (!alias) {
    throw new CliError(
      [
        "No import alias found. Add one to tsconfig.json (tsconfig.app.json for Vite):",
        '  "compilerOptions": { "paths": { "@/*": ["./src/*"] } }',
        "Vite also needs the same alias in vite.config (resolve.alias).",
      ].join("\n"),
    );
  }

  const style = opts.style ?? (info.tailwind ? "tailwind" : "css");
  if (style !== "tailwind" && style !== "css")
    throw new CliError(`Unknown style "${style}". Use tailwind or css.`);

  const registry = opts.registry ?? DEFAULT_REGISTRY;
  const index = await fetchIndex(registry);
  if (!index.styles.includes(style)) {
    throw new CliError(
      style === "css"
        ? "Tailwind wasn't found, and the plain-CSS components aren't published yet. Add Tailwind v4 for now."
        : `The registry doesn't have the "${style}" style.`,
    );
  }

  const code = opts.theme ?? previous?.theme;
  const theme = code ? await loadTheme(code, registry, style) : undefined;

  p.log.info(
    [
      `Framework: ${info.framework}`,
      `Style: ${style === "tailwind" ? `Tailwind v${info.tailwind}` : "CSS files"}`,
      `Alias: ${alias.prefix}/* -> ${alias.dir}/*`,
      `Package manager: ${info.packageManager}`,
    ].join("\n"),
  );

  // 2. Where things go.
  const found = await findGlobalsCss(info);
  if (opts.yes && !found) {
    throw new CliError("Couldn't find your main stylesheet. Run init without --yes to pick it.");
  }
  const globals =
    opts.yes && found
      ? found
      : answer(
          await p.text({
            message: "Which stylesheet does your app load?",
            initialValue: found ?? "",
            placeholder: info.framework === "next" ? "src/app/globals.css" : "src/index.css",
            validate: (v) =>
              v && existsSync(path.join(root, v)) ? undefined : "That file doesn't exist.",
          }),
        );

  const base = alias.dir === "." ? "" : `${alias.dir}/`;
  let componentsAlias = `${alias.prefix}/components/cl`;
  if (!opts.yes) {
    componentsAlias = answer(
      await p.text({
        message: "Import alias for components?",
        initialValue: componentsAlias,
        validate: (v) =>
          v?.startsWith(`${alias.prefix}/`) ? undefined : `Must start with ${alias.prefix}/`,
      }),
    );
  }

  const globalsPath = path.join(root, globals);
  let globalsCss = await readFile(globalsPath, "utf8");
  const tokens = style === "css" || (!info.shadcn && !definesThemeVariables(globalsCss));

  const config: Config = {
    style,
    tsx: true,
    framework: info.framework,
    registry,
    ...(theme ? { theme: theme.code } : {}),
    css: {
      globals,
      dir: `${base}styles`,
      entry: `${base}styles/cl.css`,
      tokens,
    },
    aliases: {
      components: componentsAlias,
      hooks: `${alias.prefix}/hooks`,
      lib: `${alias.prefix}/lib`,
      utils: `${alias.prefix}/lib/cl-utils`,
    },
  };

  // 3. Fetch and write.
  const spin = p.spinner();
  spin.start("Fetching from the registry");
  const items = await resolveItems({ registry }, style, ["init"]);
  spin.stop("Fetched");

  const written: string[] = [];
  const existingImports = cssImports(globalsCss);
  // Parts the project already has: shadcn's variables, or its variants file.
  const skip = new Set<string>();
  if (!tokens) skip.add("cl-tokens.css");
  if (existingImports.includes("shadcn/tailwind.css")) skip.add("cl-variants.css");

  const entryImports: string[] = [];
  for (const item of items) {
    if (item.name === "init") {
      // Our own CSS: always refreshed.
      const files = item.files
        .filter((f) => !skip.has(f.path))
        .map((f) => ({ ...f, content: withoutImports(f.content, existingImports) }))
        .map((f) => (theme && f.path === "cl-tokens.css" ? { ...f, content: theme.css } : f));
      const res = await writeItemFiles(
        root,
        alias,
        config,
        { ...item, files },
        { overwrite: true },
      );
      written.push(...res.written);
      entryImports.push(...files.map((f) => `./${f.path}`));
    } else {
      const res = await writeItemFiles(root, alias, config, item);
      written.push(...res.written);
    }
  }

  // cl.css: the one file globals imports. Keep any component imports already in it.
  const entryPath = path.join(root, config.css.entry);
  let entry = existsSync(entryPath)
    ? await readFile(entryPath, "utf8")
    : "/* Managed by the Cladux CLI. Components add their CSS here. */\n";
  for (const spec of entryImports) entry = addImport(entry, spec);
  await mkdir(path.dirname(entryPath), { recursive: true });
  await writeFile(entryPath, entry.endsWith("\n") ? entry : `${entry}\n`);
  written.push(config.css.entry);

  let updated = addImport(globalsCss, relativeImport(globalsPath, entryPath));
  // The starter template's own --background/--foreground would override the theme.
  let removedStarter = false;
  if (style === "tailwind" && tokens && hasStarterVariables(updated)) {
    const remove = opts.yes
      ? true
      : answer(
          await p.confirm({
            message: `${globals} sets its own --background/--foreground (from the starter). Remove them so the theme applies?`,
            initialValue: true,
          }),
        );
    if (remove) {
      const cleaned = removeStarterVariables(updated);
      removedStarter = cleaned !== updated;
      updated = cleaned;
    }
  }
  if (updated !== globalsCss) {
    await writeFile(globalsPath, updated);
    globalsCss = updated;
  }

  p.log.success(
    `Wrote ${[...new Set(written)].join(", ")}\nImported ${config.css.entry} in ${globals}` +
      (removedStarter ? "\nRemoved the starter --background/--foreground variables" : ""),
  );
  if (skip.size)
    p.log.info(`Kept what your project already has from shadcn (skipped ${[...skip].join(", ")}).`);
  if (theme && !tokens)
    p.log.warn(
      `${globals} defines the theme variables itself, so ${theme.code} wasn't applied. See the CSS with: cladux apply ${theme.code}`,
    );
  if (style === "tailwind" && tokens && hasStarterVariables(globalsCss)) {
    p.log.warn(`${globals} still defines --background/--foreground, which override the theme.`);
  }

  // 4. Packages.
  const deps = await missingDeps(
    root,
    items.flatMap((i) => i.dependencies),
  );
  if (deps.length && !opts.skipInstall) {
    p.log.step(`Installing ${deps.join(", ")}`);
    await install(root, info.packageManager, deps);
  } else if (deps.length) {
    p.log.warn(`Skipped installing: ${deps.join(" ")}`);
  }

  await writeConfig(root, config);
  p.outro(`Done. Add a component with:\n  ${runCommand(info.packageManager, "add button")}`);
}
