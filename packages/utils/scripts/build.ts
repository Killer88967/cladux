// Builds the runtime for the plain HTML components into dist/, readable and
// minified (.min):
//
//   cl.js    a classic script for a <script> tag. It starts itself when it
//            loads and puts window.cl on the page.
//   cl.mjs   an ES module for bundlers and <script type="module">. It starts
//            nothing: import { start, toast } and call start() yourself.
//
// The package's build script runs tsc first, which writes the ES module's
// types to dist/types.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { build, type BuildOptions } from "esbuild";

const SRC = new URL("../src/dom/", import.meta.url).pathname;
const DIST = new URL("../dist/", import.meta.url).pathname;

const options: BuildOptions = {
  bundle: true,
  target: "es2022",
  legalComments: "none",
  logLevel: "warning",
  write: false,
};

async function bundle(entry: string, name: string, format: "iife" | "esm") {
  const settings = { ...options, entryPoints: [`${SRC}${entry}`], format };
  const [readable, minified] = await Promise.all([
    build(settings),
    build({ ...settings, minify: true }),
  ]);
  // Readable: esbuild leaves a "// src/dom/tabs.ts" line above each file and
  // "/* @__PURE__ */" notes for minifiers; take those out.
  const js = readable
    .outputFiles![0]!.text.replace(/^\s*\/\/ src\/.+\.ts\n/gm, "")
    .replaceAll("/* @__PURE__ */ ", "");
  const ext = format === "esm" ? "mjs" : "js";
  await writeFile(`${DIST}${name}.${ext}`, js);
  await writeFile(`${DIST}${name}.min.${ext}`, minified.outputFiles![0]!.text);
}

await mkdir(DIST, { recursive: true });
await Promise.all([bundle("auto.ts", "cl", "iife"), bundle("index.ts", "cl", "esm")]);

// The types import each other as "./toast"; Node's ES module resolution needs
// "./toast.js", which TypeScript maps to toast.d.ts.
const TYPES = `${DIST}types/`;
for (const file of await readdir(TYPES)) {
  const text = await readFile(`${TYPES}${file}`, "utf8");
  const fixed = text.replace(/from "(\.\/[^"]+?)(\.js)?"/g, 'from "$1.js"');
  await writeFile(`${TYPES}${file}`, fixed);
}

console.log("dist: cl.js and cl.mjs, each with a .min, and types/");
