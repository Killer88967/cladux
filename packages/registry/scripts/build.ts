// Builds dist/: the library bundled, with no runtime dependencies,
// plus its type declarations.
import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { build } from "esbuild";

const root = new URL("../", import.meta.url);
await rm(new URL("dist/", root), { recursive: true, force: true });
await build({
  entryPoints: ["index", "theme"].map((name) => new URL(`src/${name}.ts`, root).pathname),
  outdir: new URL("dist/", root).pathname,
  bundle: true,
  splitting: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "info",
});
execFileSync("tsc", ["-p", "tsconfig.build.json"], { cwd: root, stdio: "inherit" });
