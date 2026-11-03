import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface PathAlias {
  /** "@" for "@/*" */
  prefix: string;
  /** Folder it points at, relative to the project root, e.g. "src". */
  dir: string;
}

/** Parses tsconfig-style JSON: comments and trailing commas allowed. */
export function parseJsonc(text: string): unknown {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inString) {
      out += c;
      if (c === "\\") out += text[++i] ?? "";
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2);
      if (i === -1) break;
      i++;
    } else {
      out += c;
    }
  }
  return JSON.parse(stripTrailingCommas(out));
}

/** Drops commas right before } or ], leaving commas inside strings alone. */
function stripTrailingCommas(text: string) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inString) {
      out += c;
      if (c === "\\") out += text[++i] ?? "";
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "," && /^\s*[}\]]/.test(text.slice(i + 1))) {
      // skip it
    } else {
      out += c;
    }
  }
  return out;
}

interface TsConfig {
  compilerOptions?: { paths?: Record<string, string[]> };
  references?: { path: string }[];
}

/**
 * Finds the project's import alias ("@/*" -> "./src/*"). Checks tsconfig.json
 * and the configs it references (Vite keeps paths in tsconfig.app.json).
 * TypeScript 7 has no baseUrl, so paths are relative to their config file.
 */
export async function findPathAlias(root: string): Promise<PathAlias | null> {
  const queue = ["tsconfig.json", "jsconfig.json"];
  const seen = new Set<string>();

  while (queue.length) {
    const rel = queue.shift()!;
    const file = path.join(root, rel);
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);

    const config = parseJsonc(await readFile(file, "utf8")) as TsConfig;
    const paths = config.compilerOptions?.paths ?? {};
    const keys = Object.keys(paths).filter((k) => k.endsWith("/*"));
    // Prefer the conventional "@/*" when there are several.
    keys.sort((a, b) => (a === "@/*" ? -1 : b === "@/*" ? 1 : 0));

    for (const key of keys) {
      const target = paths[key]?.[0];
      if (!target?.endsWith("/*")) continue;
      const dir = path.relative(root, path.resolve(path.dirname(file), target.slice(0, -2)));
      return { prefix: key.slice(0, -2), dir: dir.split(path.sep).join("/") || "." };
    }

    for (const ref of config.references ?? []) {
      const refPath = path.relative(root, path.resolve(path.dirname(file), ref.path));
      queue.push(refPath.endsWith(".json") ? refPath : path.join(refPath, "tsconfig.json"));
    }
  }
  return null;
}

/** "\<root>/src/ui" -> "@/ui", or null when the folder is outside the alias. */
export function pathToAlias(root: string, alias: PathAlias, dir: string) {
  const rel = path.relative(path.join(root, alias.dir), dir).split(path.sep).join("/");
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel ? `${alias.prefix}/${rel}` : alias.prefix;
}

/** "@/components/cl" -> "\<root>/src/components/cl" */
export function aliasToPath(root: string, alias: PathAlias, value: string) {
  if (value !== alias.prefix && !value.startsWith(`${alias.prefix}/`)) {
    throw new Error(`"${value}" doesn't start with the "${alias.prefix}/" alias`);
  }
  return path.join(root, alias.dir, value.slice(alias.prefix.length));
}
