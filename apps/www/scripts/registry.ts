// Builds the registry the CLI installs from: public/r/index.json plus one
// JSON file per component, hook and lib in public/r/<style>/<name>.json.
// Source of truth stays in packages/*; this only reads and repackages it.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import * as prettier from "prettier";
import { buildCssStyle } from "./css-style.ts";
import { blocks } from "../../../packages/ui/src/blocks/_blocks.ts";

const ROOT = new URL("../../../", import.meta.url);
const UI = new URL("packages/ui/src/", ROOT);
const DOCS = new URL("apps/www/src/content/docs/components/", ROOT);
const OUT = new URL("apps/www/public/r/", ROOT);

const STYLE = "tailwind";

// Imports in the published files use the default aliases from cl.json.
// The CLI swaps these prefixes for whatever the user configured.
const DEFAULT_ALIASES = {
  components: "@/components/cl",
  hooks: "@/hooks",
  lib: "@/lib",
  utils: "@/lib/cl-utils",
};

type FileType = "ui" | "hook" | "lib" | "css";

interface RegistryFile {
  /** Path relative to the folder for its type (aliases.components, aliases.hooks, ...). */
  path: string;
  type: FileType;
  content: string;
}

interface RegistryItem {
  name: string;
  type: "registry:ui" | "registry:block" | "registry:hook" | "registry:lib" | "registry:style";
  style: string;
  description?: string;
  /** npm packages, with the version range we build and test against. */
  dependencies: string[];
  /** Other registry items this one needs (installed first). */
  registryDependencies: string[];
  files: RegistryFile[];
}

const uiPkg = JSON.parse(await readFile(new URL("packages/ui/package.json", ROOT), "utf8"));
const utilsPkg = JSON.parse(await readFile(new URL("packages/utils/package.json", ROOT), "utf8"));
const stylesPkg = JSON.parse(await readFile(new URL("packages/styles/package.json", ROOT), "utf8"));
const versions: Record<string, string> = {
  ...stylesPkg.dependencies,
  ...utilsPkg.dependencies,
  ...uiPkg.dependencies,
};

// Provided by the user's app, never installed by the CLI.
const PROVIDED = new Set(["react", "react-dom", "next"]);

/** "@base-ui/react/x" -> "@base-ui/react", "shiki/core" -> "shiki" */
const packageName = (spec: string) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]!;

/** Rewrites workspace imports to alias imports and collects what the file depends on. */
function processSource(code: string) {
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  const content = code.replace(
    /(from\s+|import\s+)"([^"]+)"/g,
    (whole, lead: string, spec: string) => {
      let to: string | undefined;
      // ../button/button, ./button/button, ../hooks/use-mobile, ../lib/highlighter
      const local = /^\.\.?\/(?:([\w-]+)\/)?([\w-]+)$/.exec(spec);

      if (spec === "@cladux/utils") {
        registryDependencies.add("utils");
        to = DEFAULT_ALIASES.utils;
      } else if (local) {
        const folder = local[1];
        const name = local[2]!;
        registryDependencies.add(name);
        const base =
          folder === "hooks"
            ? DEFAULT_ALIASES.hooks
            : folder === "lib"
              ? DEFAULT_ALIASES.lib
              : DEFAULT_ALIASES.components;
        to = `${base}/${name}`;
      } else if (!spec.startsWith(".")) {
        const name = packageName(spec);
        if (!PROVIDED.has(name)) {
          const range = versions[name];
          if (!range) throw new Error(`No version for "${name}" in packages/ui or packages/utils`);
          dependencies.add(`${name}@${range}`);
        }
      } else {
        throw new Error(`Unhandled relative import "${spec}"`);
      }

      return to ? `${lead}"${to}"` : whole;
    },
  );

  return {
    content,
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  };
}

/** The description from the component's docs page, if it has one. */
async function description(name: string) {
  const file = new URL(`${name}.mdx`, DOCS);
  if (!existsSync(file)) return undefined;
  const mdx = await readFile(file, "utf8");
  return mdx.match(/description:\s*"([^"]*)"/)?.[1] || undefined;
}

const items: RegistryItem[] = [];

// utils: the cn() helper every component imports.
{
  const content = await readFile(new URL("packages/utils/src/cn.ts", ROOT), "utf8");
  const { dependencies } = processSource(content);
  items.push({
    name: "utils",
    type: "registry:lib",
    style: STYLE,
    description: "The cn() helper for joining class names.",
    dependencies,
    registryDependencies: [],
    files: [{ path: "cl-utils.ts", type: "lib", content }],
  });
}

// hooks and lib files that live next to the components.
for (const [dir, type, itemType] of [
  ["hooks", "hook", "registry:hook"],
  ["lib", "lib", "registry:lib"],
] as const) {
  for (const file of await readdir(new URL(`${dir}/`, UI))) {
    const name = file.replace(/\.tsx?$/, "");
    const src = await readFile(new URL(`${dir}/${file}`, UI), "utf8");
    const processed = processSource(src);
    items.push({
      name,
      type: itemType,
      style: STYLE,
      dependencies: processed.dependencies,
      registryDependencies: processed.registryDependencies,
      files: [{ path: file, type, content: processed.content }],
    });
  }
}

// One item per component folder: packages/ui/src/<name>/<name>.tsx
for (const dir of await readdir(UI, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === "hooks" || dir.name === "lib") continue;
  const file = new URL(`${dir.name}/${dir.name}.tsx`, UI);
  if (!existsSync(file)) continue;
  const processed = processSource(await readFile(file, "utf8"));
  items.push({
    name: dir.name,
    type: "registry:ui",
    style: STYLE,
    description: await description(dir.name),
    dependencies: processed.dependencies,
    registryDependencies: processed.registryDependencies,
    files: [{ path: `${dir.name}.tsx`, type: "ui", content: processed.content }],
  });
}

// Blocks: packages/ui/src/blocks/<name>.tsx, installed to <components>/blocks/.
for (const block of blocks) {
  const processed = processSource(await readFile(new URL(`blocks/${block.name}.tsx`, UI), "utf8"));
  items.push({
    name: block.name,
    type: "registry:block",
    style: STYLE,
    description: block.description,
    dependencies: processed.dependencies,
    registryDependencies: processed.registryDependencies,
    files: [{ path: `blocks/${block.name}.tsx`, type: "ui", content: processed.content }],
  });
}

// init: what `cladux init` writes for this style. Separate files so the CLI can
// skip the parts a project already has (e.g. shadcn's variables or variants).
{
  const tokens = await readFile(new URL("packages/tokens/dist/tokens.css", ROOT), "utf8");
  const theme = (await readFile(new URL("packages/tokens/dist/theme.css", ROOT), "utf8")).replace(
    /^@import "\.\/tokens\.css";\n+/m,
    "",
  );
  // shadcn's variants (data-open:, data-checked:...) and accordion keyframes,
  // inlined so projects don't need the whole shadcn package for one CSS file.
  const require = createRequire(new URL("packages/styles/package.json", ROOT));
  const variants = await readFile(require.resolve("shadcn/tailwind.css"), "utf8");

  items.push({
    name: "init",
    type: "registry:style",
    style: STYLE,
    description: "Theme variables and the Tailwind setup every component expects.",
    dependencies: [`tw-animate-css@${versions["tw-animate-css"]}`],
    registryDependencies: ["utils"],
    files: [
      { path: "cl-tokens.css", type: "css", content: tokens },
      {
        path: "cl-variants.css",
        type: "css",
        content: `/* From shadcn/ui (MIT) - https://github.com/shadcn-ui/ui */\n${variants}`,
      },
      {
        path: "cl-theme.css",
        type: "css",
        content:
          [
            `@import "tw-animate-css";`,
            theme.trim(),
            `@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}`,
          ].join("\n\n") + "\n",
      },
    ],
  });
}

// Every registry dependency has to resolve to a real item.
const names = new Set(items.map((i) => i.name));
for (const item of items) {
  for (const dep of item.registryDependencies) {
    if (!names.has(dep)) throw new Error(`${item.name} depends on unknown item "${dep}"`);
  }
}

items.sort((a, b) => a.name.localeCompare(b.name));

// The css style: the same components with `cl-*` classes and a stylesheet each,
// generated from the Tailwind ones so the two always match.
const cssItems = await buildCssItems(items);

await rm(OUT, { recursive: true, force: true });
for (const [style, list] of [
  [STYLE, items],
  ["css", cssItems],
] as const) {
  await mkdir(new URL(`${style}/`, OUT), { recursive: true });
  await Promise.all(
    list.map((item) =>
      writeFile(new URL(`${style}/${item.name}.json`, OUT), `${JSON.stringify(item, null, 2)}\n`),
    ),
  );
}

const index = {
  styles: [STYLE, "css"],
  aliases: DEFAULT_ALIASES,
  items: items.map(({ name, type, description, registryDependencies }) => ({
    name,
    type,
    description,
    registryDependencies,
  })),
};
await writeFile(new URL("index.json", OUT), `${JSON.stringify(index, null, 2)}\n`);

console.log(`registry: ${items.length} items -> public/r/${STYLE} and public/r/css`);

async function buildCssItems(tailwind: RegistryItem[]): Promise<RegistryItem[]> {
  const sources = new Map<string, string>();
  for (const item of tailwind) {
    if (item.type === "registry:style" || item.name === "utils") continue;
    for (const file of item.files) sources.set(item.name, file.content);
  }
  const result = await buildCssStyle(sources);

  // Tidy the rewritten sources the same way the repo is formatted.
  const format = (code: string) => prettier.format(code, { parser: "typescript", printWidth: 100 });

  return Promise.all(
    tailwind.map(async (item): Promise<RegistryItem> => {
      const css = { ...item, style: "css" };
      if (item.name === "utils") {
        return {
          ...css,
          description: "The cn() helper for joining class names.",
          dependencies: [`clsx@${versions.clsx}`],
          files: [
            {
              path: "cl-utils.ts",
              type: "lib",
              content: `import { clsx, type ClassValue } from "clsx";

/** Joins class names, skipping falsy ones. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
`,
            },
          ],
        };
      }
      if (item.type === "registry:style") {
        return {
          ...css,
          description: "Theme variables, a reset scoped to Cladux elements, and shared CSS.",
          dependencies: [],
          files: [
            { path: "cl-tokens.css", type: "css", content: result.tokens },
            { path: "cl-base.css", type: "css", content: result.base },
          ],
        };
      }
      const stylesheet = result.css.get(item.name);
      return {
        ...css,
        files: [
          ...(await Promise.all(
            item.files.map(async (f) => ({
              ...f,
              content: await format(result.files.get(item.name) ?? f.content),
            })),
          )),
          ...(stylesheet
            ? [{ path: `${item.name}.css`, type: "css" as const, content: stylesheet }]
            : []),
        ],
      };
    }),
  );
}
