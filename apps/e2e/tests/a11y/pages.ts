import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

// Every page in the search index (the docs, examples and the other pages), the
// home page, and each block on its own.
const search: { href: string; parent?: string; group: string }[] = JSON.parse(
  read("../../../www/public/search.json"),
);
const pages = search
  .filter((e) => !e.parent && !e.href.includes("#") && e.group !== "Blocks" && e.group !== "Charts")
  .map((e) => e.href);
const blocks = [
  ...read("../../../../packages/ui/src/blocks/_blocks.ts").matchAll(/name: "([a-z0-9-]+)"/g),
].map((m) => `/view/${m[1]}`);

export const PAGES = [...new Set(["/", ...pages, ...blocks])];
