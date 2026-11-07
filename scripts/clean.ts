// Deletes everything the builds make, to start over or free disk space:
// Turborepo's cache, the site's .next (with Next's cache), each package's dist
// and the generated files. Keeps node_modules, so no reinstall is needed.
//
//   pnpm clean
import { readdir, rm } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const workspaces = [
  "apps/www",
  ...(await readdir(new URL("packages/", ROOT))).map((name) => `packages/${name}`),
];

const paths = [
  ".turbo",
  ...workspaces.flatMap((dir) => [
    `${dir}/.turbo`,
    `${dir}/dist`,
    `${dir}/node_modules/.cache`,
    `${dir}/tsconfig.tsbuildinfo`,
  ]),
  "apps/www/.next",
  "apps/www/public/r",
  "apps/www/public/cl",
  "apps/www/public/schema",
  "apps/www/public/docs",
  "apps/www/public/docs.md",
  "apps/www/public/llms.txt",
  "apps/www/public/llms-full.txt",
  "apps/www/public/search.json",
  "apps/www/src/lib/examples.generated.ts",
  "apps/www/src/lib/charts.generated.ts",
  "apps/www/src/components/demos.generated.tsx",
  "apps/www/src/components/blocks.generated.tsx",
];

await Promise.all(paths.map((path) => rm(new URL(path, ROOT), { recursive: true, force: true })));
console.log("clean: removed build output and caches. Run `pnpm build` to build again.");
