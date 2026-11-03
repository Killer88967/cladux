import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Fingerprints of the files the CLI wrote, so update can tell your edits
 * from files you haven't touched. Commit it with the rest of your project.
 */
export const LOCK_FILE = "cl-lock.json";

export interface Lock {
  files: Record<string, string>;
}

/** Line endings and the final newline don't count as changes. */
export const normalize = (text: string) => `${text.replaceAll("\r\n", "\n").trimEnd()}\n`;

export const fingerprint = (text: string) =>
  createHash("sha256").update(normalize(text)).digest("hex").slice(0, 16);

/** The lock's key for a file: its path from the project root, with forward slashes. */
export const lockKey = (root: string, file: string) =>
  path.relative(root, file).split(path.sep).join("/");

export async function readLock(root: string): Promise<Lock> {
  const file = path.join(root, LOCK_FILE);
  if (!existsSync(file)) return { files: {} };
  return JSON.parse(await readFile(file, "utf8")) as Lock;
}

/** Adds or replaces fingerprints, keeping the keys sorted for tidy git diffs. */
export async function recordFiles(root: string, fingerprints: Record<string, string>) {
  if (!Object.keys(fingerprints).length) return;
  const lock = await readLock(root);
  const files = { ...lock.files, ...fingerprints };
  const sorted = Object.fromEntries(
    Object.keys(files)
      .sort()
      .map((k) => [k, files[k]!]),
  );
  await writeFile(path.join(root, LOCK_FILE), `${JSON.stringify({ files: sorted }, null, 2)}\n`);
}
