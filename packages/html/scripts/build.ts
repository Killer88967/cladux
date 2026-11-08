// Copies the plain HTML files into this package, each with a line saying which
// version it is: cl.css and cl.min.css from @cladux/styles, cl.js and
// cl.min.js from @cladux/utils. They sit at the package's root, so the CDN
// links stay short:
//
//   https://cdn.jsdelivr.net/npm/cladux-html@0.2.0/cl.min.css
import { readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const { version, license } = JSON.parse(await readFile(new URL("package.json", ROOT), "utf8"));
const banner = `/*! cladux-html v${version} | ${license} | https://cladux.vercel.app/docs/html */\n`;

for (const [from, to] of [
  ["../styles/dist/cl.css", "cl.css"],
  ["../styles/dist/cl.min.css", "cl.min.css"],
  ["../utils/dist/cl.js", "cl.js"],
  ["../utils/dist/cl.min.js", "cl.min.js"],
] as const) {
  const content = await readFile(new URL(from, ROOT), "utf8");
  await writeFile(new URL(to, ROOT), banner + content);
}
console.log(`cladux-html: cl.css, cl.min.css, cl.js and cl.min.js for v${version}`);
