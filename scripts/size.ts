// Checks that nothing we ship has grown past its budget: the JavaScript each page
// of the site loads, and each file the npm packages publish. Run after `pnpm build`:
//
//   node scripts/size.ts
//
// Page sizes are gzipped, which is what browsers download. Package files are
// their size on disk, which is what npm installs. When something goes over,
// find out why before raising its budget here.
import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const ROOT = new URL("../", import.meta.url);

/** Budgets in KB. */
const BUDGETS = {
  /** The JS a page's script tags load, gzipped. Demos load on top, only where they show. */
  page: 350,
  /** Pages with a lot on them, allowed more. */
  pages: {
    "/": 450,
    "/charts": 450,
    "/themes": 450,
    "/examples/dashboard": 400,
  } as Record<string, number>,
  /** Any one file in a package's dist, on disk. */
  file: 500,
  /** Files allowed more than `file`, by name without the hash. Say why next to each one. */
  files: {} as Record<string, number>,
};

const kb = (bytes: number) => Math.round(bytes / 1024);
const gzip = async (file: URL) => gzipSync(await readFile(file)).length;

const over: string[] = [];
const rows: [string, number, number][] = [];

// Pages: every prerendered page's <script src="/_next/static/chunks/..."> files.
const NEXT = new URL("apps/www/.next/", ROOT);
const APP = new URL("server/app/", NEXT);
const chunkSizes = new Map<string, number>();
for (const file of await readdir(APP, { recursive: true })) {
  if (!file.endsWith(".html")) continue;
  const html = await readFile(new URL(file, APP), "utf8");
  const chunks = new Set(html.match(/(?<=<script src="\/_next\/)static\/chunks\/[^"]+/g));
  let total = 0;
  for (const chunk of chunks) {
    if (!chunkSizes.has(chunk)) chunkSizes.set(chunk, await gzip(new URL(chunk, NEXT)));
    total += chunkSizes.get(chunk)!;
  }
  const route = "/" + file.slice(0, -5).replace(/(^|\/)index$/, "");
  const budget = BUDGETS.pages[route] ?? BUDGETS.page;
  rows.push([route, kb(total), budget]);
  if (kb(total) > budget) over.push(`${route}: ${kb(total)} KB of JS (budget ${budget} KB)`);
}
if (!rows.length) throw new Error("No pages found. Run `pnpm build` first.");

// Packages: each file in packages/*/dist.
const PACKAGES = new URL("packages/", ROOT);
for (const pkg of await readdir(PACKAGES)) {
  const dist = new URL(`${pkg}/dist/`, PACKAGES);
  const files = await readdir(dist, { recursive: true, withFileTypes: true }).catch(() => []);
  for (const entry of files) {
    if (!entry.isFile() || entry.name.endsWith(".map")) continue;
    const file = new URL(`${entry.parentPath}/${entry.name}`, "file://");
    const name = `packages/${pkg}/dist/${file.pathname.slice(dist.pathname.length)}`;
    // Chunk names end in a hash that changes with every build; budgets use the name without it.
    const key = name.replace(/-[A-Z0-9]{8}(?=\.\w+$)/, "");
    const budget = BUDGETS.files[key] ?? BUDGETS.file;
    const size = kb((await stat(file)).size);
    rows.push([name, size, budget]);
    if (size > budget) over.push(`${name}: ${size} KB (budget ${budget} KB)`);
  }
}

// The biggest of each, so the CI log shows where things stand.
const width = Math.max(...rows.map(([name]) => name.length));
console.log("Page or file".padEnd(width), "   KB  budget");
for (const [name, size, budget] of rows.sort((a, b) => b[1] / b[2] - a[1] / a[2]).slice(0, 15)) {
  console.log(name.padEnd(width), String(size).padStart(5), String(budget).padStart(7));
}

if (over.length) {
  console.error(`\nOver budget:\n  ${over.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} pages and files are within budget.`);
