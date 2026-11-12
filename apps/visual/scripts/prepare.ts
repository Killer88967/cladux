// Writes packages/ui/.visual/<style>/ for each style in the built registry
// (apps/www/public/r): every component, hook and lib file, where `cladux add`
// would put them in a project, plus:
//
//   index.ts     the same exports as @cladux/ui, from these files
//   css/cl.css   the style's CSS: the init files first, then each component's,
//                after the components it uses, in the order `cladux add` writes them
//
// The harness renders the demos against these, so a screenshot shows exactly
// what someone gets from the registry. Living inside packages/ui, the files
// find the same npm packages @cladux/ui uses. Run `pnpm build` first.
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "../../..");
const REGISTRY = path.join(REPO, "apps/www/public/r");
const OUT = path.join(REPO, "packages/ui/.visual");

interface Item {
  name: string;
  type: string;
  registryDependencies?: string[];
  files: { path: string; type: "ui" | "hook" | "lib" | "css"; content: string }[];
}

if (!existsSync(path.join(REGISTRY, "index.json"))) {
  throw new Error(`No registry at ${REGISTRY}. Run \`pnpm build\` first.`);
}
const index: { styles: string[]; items: { name: string; type: string }[] } = JSON.parse(
  await readFile(path.join(REGISTRY, "index.json"), "utf8"),
);
const FOLDERS = { ui: "components/cl", hook: "hooks", lib: "lib", css: "css" } as const;

// @cladux/ui's own index, pointed at the registry's files: "./button/button"
// is components/cl/button.tsx there, and "./hooks/use-x" is hooks/use-x.ts.
const barrel = (await readFile(path.join(REPO, "packages/ui/src/index.ts"), "utf8")).replace(
  /from "\.\/([a-z0-9-]+)\/([a-z0-9-]+)"/g,
  (_, dir: string, file: string) =>
    dir === "hooks" ? `from "./hooks/${file}"` : `from "./components/cl/${dir}"`,
);

await rm(OUT, { recursive: true, force: true });
for (const style of index.styles) {
  const dir = path.join(OUT, style);
  const items = new Map<string, Item>();
  for (const entry of index.items) {
    if (entry.type === "registry:block") continue;
    const item: Item = JSON.parse(
      await readFile(path.join(REGISTRY, style, `${entry.name}.json`), "utf8"),
    );
    items.set(item.name, item);
    for (const file of item.files) {
      const target = path.join(dir, FOLDERS[file.type], file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
    }
  }

  const css: string[] = [];
  const visited = new Set<string>();
  const visit = (name: string) => {
    const item = items.get(name);
    if (!item || visited.has(name)) return;
    visited.add(name);
    for (const dep of item.registryDependencies ?? []) visit(dep);
    for (const file of item.files) if (file.type === "css") css.push(`./${file.path}`);
  };
  // The theme and base styles go first, like `cladux init` writes them.
  visit("init");
  for (const name of items.keys()) visit(name);

  await writeFile(
    path.join(dir, "css/cl.css"),
    css.map((f) => `@import "${f}";`).join("\n") + "\n",
  );
  await writeFile(path.join(dir, "index.ts"), barrel);
  console.log(`visual: ${style}: ${css.length} stylesheets`);
}
