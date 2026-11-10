// Builds the plain-CSS library into dist/, readable and minified:
//
//   cl.css               everything in one file: theme, base, components, layout helpers
//   core.css             everything but the components: theme, base, layout helpers
//   components/<name>.css  one component, for a page that loads only what it uses
//
// core.css plus every component file is the same CSS as cl.css, in the same
// cascade layers, so they can be mixed. The site serves cl.css at /cl/cl.css.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { build, type BuildOptions } from "esbuild";

const SRC = new URL("../src/", import.meta.url).pathname;
const DIST = new URL("../dist/", import.meta.url).pathname;
const LAYERS = "@layer cl.base, cl.components, cl.utilities;";

// Shared styles a component needs, bundled into its file. A page that loads
// several of these gets them more than once, which is harmless.
const NEEDS: Record<string, string[]> = {
  combobox: ["floating"],
  "dropdown-menu": ["floating"],
  popover: ["floating"],
  tooltip: ["floating"],
};
// Parts of other files, not components of their own.
const SHARED = new Set(["index", "floating"]);

const options: BuildOptions = {
  bundle: true,
  target: ["chrome120", "edge120", "firefox125", "safari17"],
  legalComments: "none",
  logLevel: "warning",
  write: false,
};

/** Bundles CSS that imports from `dir`, and writes `<name>.css` and `<name>.min.css`. */
async function bundle(name: string, contents: string, dir: string) {
  const stdin = { contents, resolveDir: dir, loader: "css" } as const;
  const [readable, minified] = await Promise.all([
    build({ ...options, stdin }),
    build({ ...options, stdin, minify: true }),
  ]);
  // esbuild leaves a "/* src/base.css */" line above each file it bundles; take those out.
  const css = readable
    .outputFiles![0]!.text.replace(/^\/\* (?:.+\.css|<stdin>) \*\/\n/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  await writeFile(`${DIST}${name}.css`, `${css}\n`);
  await writeFile(`${DIST}${name}.min.css`, minified.outputFiles![0]!.text);
}

await mkdir(`${DIST}components`, { recursive: true });

await bundle("cl", `@import "./index.css";`, SRC);

await bundle(
  "core",
  `${LAYERS}
@import "@cladux/tokens/tokens.css";
@import "./base.css" layer(cl.base);
@import "./utilities.css" layer(cl.utilities);`,
  SRC,
);

const names = (await readdir(`${SRC}components`))
  .filter((file) => file.endsWith(".css"))
  .map((file) => file.slice(0, -4))
  .filter((name) => !SHARED.has(name));

await Promise.all(
  names.map((name) =>
    bundle(
      `components/${name}`,
      // The layer order first, so the file works even if it loads before core.css.
      [
        LAYERS,
        ...[...(NEEDS[name] ?? []), name].map((n) => `@import "./${n}.css" layer(cl.components);`),
      ].join("\n"),
      `${SRC}components`,
    ),
  ),
);

console.log(`dist: cl.css, core.css and ${names.length} components, each with a .min.css`);
