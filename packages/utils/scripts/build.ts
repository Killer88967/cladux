// Builds dist/cl.js and dist/cl.min.js: the runtime for the plain HTML
// components, as one script for a <script> tag. It starts itself when it loads.
import { mkdir, writeFile } from "node:fs/promises";
import { build, type BuildOptions } from "esbuild";

const entry = new URL("../src/dom/auto.ts", import.meta.url).pathname;
const outDir = new URL("../dist/", import.meta.url).pathname;

const options: BuildOptions = {
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  target: "es2022",
  legalComments: "none",
  logLevel: "info",
};

const readable = await build({ ...options, write: false });
const js = readable.outputFiles[0]!.text.replace(/^\s*\/\/ src\/.+\.ts\n/gm, "").replaceAll(
  "/* @__PURE__ */ ",
  "",
);
await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}cl.js`, js);

await build({ ...options, minify: true, outfile: `${outDir}cl.min.js` });
