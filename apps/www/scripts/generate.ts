// Writes the site's generated files: the demo and block lists, the registry
// in public/r, the docs for AI assistants and the search index. The scripts
// run in order, since llms.ts reads what registry.ts writes.
//
//   node scripts/generate.ts         skips them when nothing they read has changed
//   node scripts/generate.ts --force runs them anyway
//   node scripts/generate.ts --dev   then starts `next dev`, and runs them again on save
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, watch } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const SCRIPTS = ["examples", "registry", "llms", "search"];

const ROOT = new URL("../../../", import.meta.url);
const WWW = new URL("apps/www/", ROOT);

/** Everything the scripts read. A change to any of them runs the scripts again. */
const INPUTS = [
  "apps/www/scripts/",
  "apps/www/src/content/docs/",
  "apps/www/src/lib/",
  "packages/ui/src/",
  "packages/ui/package.json",
  "packages/utils/src/",
  "packages/utils/package.json",
  "packages/utils/dist/cl.js",
  "packages/styles/src/",
  "packages/styles/examples/",
  "packages/styles/package.json",
  "packages/styles/dist/cl.css",
  "packages/tokens/dist/",
  "packages/css-style/src/",
  "packages/registry/src/schemas/",
  "pnpm-lock.yaml",
];

/** What the scripts write. If any is missing, they run even when nothing changed. */
const OUTPUTS = [
  "src/lib/examples.generated.ts",
  "src/lib/charts.generated.ts",
  "src/components/demos.generated.tsx",
  "src/components/blocks.generated.tsx",
  "public/r/index.json",
  "public/llms.txt",
  "public/search.json",
];

const STAMP = new URL("node_modules/.cache/cladux/generate.json", WWW);

// The scripts write *.generated.* files into src/lib, which is also an input.
const ignored = (file: string) => file.includes(".generated.");

/** One hash over the path and contents of every input file. */
async function hashInputs() {
  const hash = createHash("sha1");
  for (const input of INPUTS) {
    const url = new URL(input, ROOT);
    if (!existsSync(url)) continue;
    const files = input.endsWith("/")
      ? (await readdir(url, { recursive: true, withFileTypes: true }))
          .filter((entry) => entry.isFile())
          .map((entry) => `${entry.parentPath}/${entry.name}`)
          .sort()
      : [url.pathname];
    for (const file of files) {
      if (ignored(file)) continue;
      hash.update(file.slice(ROOT.pathname.length)).update("\0");
      hash.update(await readFile(file)).update("\0");
    }
  }
  return hash.digest("hex");
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd: WWW, stdio: "inherit" });
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(" ")} exited with ${code}`)),
    );
  });
}

async function generate(force: boolean) {
  const hash = await hashInputs();
  const stamp = await readFile(STAMP, "utf8").catch(() => "{}");
  const complete = OUTPUTS.every((file) => existsSync(new URL(file, WWW)));
  if (!force && complete && JSON.parse(stamp).hash === hash) {
    console.log("generate: nothing changed, skipped");
    return;
  }
  const start = performance.now();
  for (const script of SCRIPTS) await run(process.execPath, [`scripts/${script}.ts`]);
  await mkdir(new URL("./", STAMP), { recursive: true });
  await writeFile(STAMP, JSON.stringify({ hash }));
  console.log(`generate: done in ${((performance.now() - start) / 1000).toFixed(1)}s`);
}

const args = process.argv.slice(2);
await generate(args.includes("--force"));

if (args.includes("--dev")) {
  // Next serves what's in public/ and picks up the generated files by itself.
  // Anything else on the command line goes to Next, e.g. `pnpm dev -p 3001`.
  const nextArgs = args.filter((a) => !["--", "--dev", "--force"].includes(a));
  const next = spawn("next", ["dev", ...nextArgs], { cwd: WWW, stdio: "inherit" });
  next.on("exit", (code) => process.exit(code ?? 0));

  // Run the scripts again after a save, once things go quiet for a moment, and
  // never two at a time. A failed run (a typo mid-edit) waits for the next save.
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<void> | undefined;
  let again = false;
  const onChange = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return void (again = true);
      do {
        again = false;
        running = generate(false).catch((error: Error) =>
          console.error(`generate: ${error.message}`),
        );
        await running;
      } while (again);
      running = undefined;
    }, 300);
  };
  for (const input of INPUTS) {
    const url = new URL(input, ROOT);
    if (!existsSync(url)) continue;
    watch(url, { recursive: input.endsWith("/") }, (_event, file) => {
      if (!file || !ignored(file)) onChange();
    });
  }
}
