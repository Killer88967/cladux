// Copies the plain HTML files into this package, each with a line saying which
// version it is. They sit at the package's root, so the CDN links stay short:
//
//   https://cdn.jsdelivr.net/npm/cladux-html@0.3.0/cl.min.css
//
// From @cladux/styles: cl.css (everything), core.css (everything but the
// components) and components/<name>.css. From @cladux/utils: cl.js (a classic
// script that starts itself) and cl.mjs (an ES module), with the module's
// types in types/. Each one readable and minified (.min).
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const STYLES = new URL("../styles/dist/", ROOT);
const UTILS = new URL("../utils/dist/", ROOT);
const { version, license } = JSON.parse(await readFile(new URL("package.json", ROOT), "utf8"));
const banner = `/*! cladux-html v${version} | ${license} | https://cladux.vercel.app/docs/html */\n`;

const files: [URL, string][] = [];
for (const name of ["cl.css", "cl.min.css", "core.css", "core.min.css"]) {
  files.push([new URL(name, STYLES), name]);
}
for (const name of await readdir(new URL("components/", STYLES))) {
  files.push([new URL(`components/${name}`, STYLES), `components/${name}`]);
}
for (const name of ["cl.js", "cl.min.js", "cl.mjs", "cl.min.mjs"]) {
  files.push([new URL(name, UTILS), name]);
}

await mkdir(new URL("components/", ROOT), { recursive: true });
for (const [from, to] of files) {
  await writeFile(new URL(to, ROOT), banner + (await readFile(from, "utf8")));
}

// The types, as they are.
await mkdir(new URL("types/", ROOT), { recursive: true });
const types = await readdir(new URL("types/", UTILS));
for (const name of types) {
  await writeFile(new URL(`types/${name}`, ROOT), await readFile(new URL(`types/${name}`, UTILS)));
}

console.log(`cladux-html: ${files.length} files and ${types.length} type files for v${version}`);
