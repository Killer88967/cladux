// Builds dist/cl.css and dist/cl.min.css: the whole plain-CSS library (theme,
// base, components and layout helpers) in one file, for pages that load it
// with a <link>. The site serves it at /cl/cl.css, next to the runtime script.
import { mkdir, writeFile } from "node:fs/promises";
import { build, type BuildOptions } from "esbuild";

const entry = new URL("../src/index.css", import.meta.url).pathname;
const outDir = new URL("../dist/", import.meta.url).pathname;

const options: BuildOptions = {
  entryPoints: [entry],
  bundle: true,
  target: ["chrome120", "edge120", "firefox125", "safari17"],
  legalComments: "none",
  logLevel: "info",
};

// Readable: esbuild leaves a "/* src/base.css */" line above each file it bundles; take those out.
const readable = await build({ ...options, write: false });
const cleaned = readable.outputFiles[0]!.text.replace(/^\/\* .+\.css \*\/\n/gm, "");
const css = cleaned.replace(/\n{3,}/g, "\n\n").trim();
await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}cl.css`, css);

await build({ ...options, minify: true, outfile: `${outDir}cl.min.css` });
