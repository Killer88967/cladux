import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, vi } from "vitest";

/** A tiny registry in the plain-CSS style: utils, init, button, card (needs button), hero-01. */
const ITEMS = {
  utils: {
    type: "registry:lib",
    dependencies: ["clsx@^2.1.1"],
    registryDependencies: [],
    files: [{ path: "cl-utils.ts", type: "lib", content: "export const cn = () => '';\n" }],
  },
  init: {
    type: "registry:style",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [{ path: "cl-tokens.css", type: "css", content: ":root { --cl-radius: 0.5rem; }\n" }],
  },
  button: {
    type: "registry:ui",
    description: "A button.",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [
      {
        path: "button.tsx",
        type: "ui",
        content: 'import { cn } from "@/lib/cl-utils";\n\nexport function Button() {}\n',
      },
      { path: "button.css", type: "css", content: ".cl-button { color: red; }\n" },
    ],
  },
  card: {
    type: "registry:ui",
    description: "A card with a button.",
    dependencies: [],
    registryDependencies: ["button"],
    files: [
      {
        path: "card.tsx",
        type: "ui",
        content: 'import { Button } from "@/components/cl/button";\n\nexport function Card() {}\n',
      },
    ],
  },
  "hero-01": {
    type: "registry:block",
    description: "A hero section.",
    dependencies: [],
    registryDependencies: ["button"],
    files: [
      { path: "blocks/hero-01.tsx", type: "ui", content: "export default function Hero01() {}\n" },
    ],
  },
};

export const THEMES = {
  bases: [
    {
      name: "neutral",
      title: "Neutral",
      light: { background: "white", primary: "black" },
      dark: { background: "black", primary: "white" },
    },
    {
      name: "zinc",
      title: "Zinc",
      light: { background: "white", primary: "gray" },
      dark: { background: "gray", primary: "white" },
    },
  ],
  accents: [
    {
      name: "blue",
      title: "Blue",
      light: { primary: "blue" },
      dark: { primary: "lightblue" },
    },
  ],
};

export async function writeRegistry(dir: string) {
  await mkdir(path.join(dir, "css"), { recursive: true });
  const items = Object.entries(ITEMS).map(([name, item]) => ({ name, style: "css", ...item }));
  const index = items.map(({ name, type, registryDependencies }) => ({
    name,
    type,
    registryDependencies,
  }));
  await writeFile(path.join(dir, "index.json"), JSON.stringify({ styles: ["css"], items: index }));
  await writeFile(path.join(dir, "themes.json"), JSON.stringify(THEMES));
  for (const item of items) {
    await writeFile(path.join(dir, "css", `${item.name}.json`), JSON.stringify(item));
  }
  await mkdir(path.join(dir, "docs"));
  await writeFile(
    path.join(dir, "docs", "button.md"),
    '# Button\n\nA button.\n\n```tsx\nimport { Button } from "@cladux/ui";\n```\n',
  );
}

/** Changes one file of a registry item, as if it changed upstream. */
export async function changeUpstream(registry: string, name: string, content: string) {
  const file = path.join(registry, "css", `${name}.json`);
  const item = JSON.parse(await readFile(file, "utf8"));
  item.files[0].content = content;
  await writeFile(file, JSON.stringify(item));
}

/**
 * A fresh Next.js-like project and registry in a temp folder for each test,
 * with the CLI's output silenced.
 */
export function useProject() {
  const ctx = { root: "", registry: "" };
  beforeEach(async () => {
    const tmp = await mkdtemp(path.join(tmpdir(), "cladux-"));
    ctx.root = path.join(tmp, "app");
    ctx.registry = path.join(tmp, "registry");
    await writeRegistry(ctx.registry);
    await mkdir(path.join(ctx.root, "src/app"), { recursive: true });
    await writeFile(
      path.join(ctx.root, "package.json"),
      JSON.stringify({ dependencies: { next: "16.0.0", react: "19.0.0", clsx: "2.1.1" } }),
    );
    await writeFile(
      path.join(ctx.root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
    );
    await writeFile(path.join(ctx.root, "src/app/globals.css"), "");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(path.dirname(ctx.root), { recursive: true, force: true });
  });
  return ctx;
}

export const read = (root: string, file: string) => readFile(path.join(root, file), "utf8");
