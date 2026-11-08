import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "../../../..");
/** The CLI as published: the built bundle. */
export const CLI = path.join(REPO, "packages/cli/dist/index.js");
/** The registry the site builds, used as a folder, so nothing needs the network but npm. */
export const REGISTRY = path.join(REPO, "apps/www/public/r");

export const tempDir = () => mkdtemp(path.join(tmpdir(), "cladux-e2e-"));

/** Runs a command and resolves with its output; rejects with the output when it fails. */
export function run(command: string, args: string[], cwd: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1", npm_config_yes: "true" },
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve(output)
        : reject(new Error(`${command} ${args.join(" ")} exited with ${code}\n${output}`)),
    );
  });
}

/** Runs the Cladux CLI in a project, against the local registry. */
export const cladux = (cwd: string, ...args: string[]) =>
  run(process.execPath, [CLI, ...args, "--yes", "--registry", REGISTRY], cwd);

export async function editJson(file: string, edit: (json: any) => void) {
  // tsconfig files can have comments, which JSON.parse can't read.
  const text = (await readFile(file, "utf8")).replace(/^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
  const json = JSON.parse(text);
  edit(json);
  await writeFile(file, JSON.stringify(json, null, 2));
}

export async function freePort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

/** Starts a long-running command and waits until a URL answers. */
export async function serve(command: string, args: string[], cwd: string, url: string) {
  const child: ChildProcess = spawn(command, args, { cwd, stdio: "ignore" });
  for (let i = 0; i < 120; i++) {
    if (
      await fetch(url).then(
        (r) => r.ok,
        () => false,
      )
    )
      return child;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  throw new Error(`${url} didn't answer`);
}
