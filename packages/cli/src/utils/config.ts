import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Framework } from "./detect.ts";
import { configIssues } from "./schema.ts";
import { CliError } from "./ui.ts";

/** Our own config file, so we never touch shadcn's components.json. */
export const CONFIG_FILE = "cl.json";

// Where the registry lives. Override with --registry or CLADUX_REGISTRY.
export const DEFAULT_REGISTRY = process.env.CLADUX_REGISTRY ?? "https://cladux.vercel.app/r";

/** The aliases the registry files are written with; swapped for the user's on install. */
export const REGISTRY_ALIASES = {
  components: "@/components/cl",
  hooks: "@/hooks",
  lib: "@/lib",
  utils: "@/lib/cl-utils",
};

/** Lets editors validate and autocomplete cl.json. */
export const CONFIG_SCHEMA = "https://cladux.vercel.app/schema/cl.json";

export type Aliases = typeof REGISTRY_ALIASES;

export type Registries = Record<string, string | { url: string; headers?: Record<string, string> }>;

export interface Config {
  $schema?: string;
  style: "tailwind" | "css";
  tsx: boolean;
  framework: Framework;
  registry: string;
  registries?: Registries;
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
  let config: unknown;
  try {
    config = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    throw new CliError(`${CONFIG_FILE} isn't valid JSON: ${(error as Error).message}`);
  }
  // Say what's wrong up front, instead of failing somewhere later.
  const problems = configIssues(config);
  if (problems.length) {
    throw new CliError(`${CONFIG_FILE} has problems:\n${problems.map((m) => `  ${m}`).join("\n")}`);
  }
  return config as Config;
}

export async function writeConfig(root: string, config: Config) {
  await writeFile(
    path.join(root, CONFIG_FILE),
    `${JSON.stringify({ $schema: CONFIG_SCHEMA, ...config }, null, 2)}\n`,
  );
}
