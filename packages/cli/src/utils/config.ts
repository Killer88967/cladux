import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Framework } from "./detect.ts";

/** Our own config file, so we never touch shadcn's components.json. */
export const CONFIG_FILE = "cl.json";

// Where the registry lives. Override with --registry or CLADUX_REGISTRY.
// TODO: point at the deployed docs site once it has a domain.
export const DEFAULT_REGISTRY = process.env.CLADUX_REGISTRY ?? "https://cladux.vercel.app/r";

/** The aliases the registry files are written with; swapped for the user's on install. */
export const REGISTRY_ALIASES = {
  components: "@/components/cl",
  hooks: "@/hooks",
  lib: "@/lib",
  utils: "@/lib/cl-utils",
};

export type Aliases = typeof REGISTRY_ALIASES;

export interface Config {
  style: "tailwind" | "css";
  tsx: boolean;
  framework: Framework;
  registry: string;
  css: {
    /** The stylesheet the app already loads (globals.css, index.css...). */
    globals: string;
    /** Where our CSS files go. */
    dir: string;
    /** The one file we manage; globals imports it once. */
    entry: string;
    /** false when the project already defines the theme variables (e.g. shadcn). */
    tokens: boolean;
  };
  aliases: Aliases;
}

export async function readConfig(root: string): Promise<Config | null> {
  const file = path.join(root, CONFIG_FILE);
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, "utf8")) as Config;
}

export async function writeConfig(root: string, config: Config) {
  await writeFile(path.join(root, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`);
}
