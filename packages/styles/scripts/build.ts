// Builds dist/cl.css: the whole plain-CSS library (theme, base, components and
// layout helpers) in one file, for pages that load it with a <link>. The site
// serves it at /cl/cl.css, next to the runtime script.
import { build } from "esbuild";

await build({
  entryPoints: [new URL("../src/index.css", import.meta.url).pathname],
  outfile: new URL("../dist/cl.css", import.meta.url).pathname,
  bundle: true,
  // minify: true,
  target: ["chrome120", "edge120", "firefox125", "safari17"],
  logLevel: "info",
});
