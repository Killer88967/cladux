// Builds dist/: the library bundled into one file (no runtime dependencies),
// plus its type declarations.
import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { build } from "esbuild";

const root = new URL("../", import.meta.url);
await rm(new URL("dist/", root), { recursive: true, force: true });
await build({
  entryPoints: [new URL("src/index.ts", root).pathname],
  outfile: new URL("dist/index.js", root).pathname,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "info",
});
execFileSync("tsc", ["-p", "tsconfig.build.json"], { cwd: root, stdio: "inherit" });
