// Copies the plain HTML files into this package, each with a line saying which
// version it is: cl.css from @cladux/styles and cl.js from @cladux/utils. They
// sit at the package's root, so the CDN links stay short:
//
//   https://cdn.jsdelivr.net/npm/cladux-html@0.1.0/cl.css
import { mkdir, readFile, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const { version, license } = JSON.parse(await readFile(new URL("package.json", ROOT), "utf8"));
const banner = `/*! cladux-html v${version} | ${license} | https://cladux.vercel.app/docs/html */\n`;

for (const [from, to] of [
  ["../styles/dist/cl.css", "dist/cl.css"],
  ["../styles/dist/cl.min.css", "dist/cl.min.css"],
  ["../utils/dist/cl.js", "dist/cl.js"],
  ["../utils/dist/cl.min.js", "dist/cl.min.js"],
] as const) {
  const content = await readFile(new URL(from, ROOT), "utf8");
  await mkdir("dist", { recursive: true });
  await writeFile(new URL(to, ROOT), banner + content);
}
console.log(`cladux-html: cl.css and cl.js for v${version}`);
