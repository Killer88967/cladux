import { existsSync } from "node:fs";
import path from "node:path";
import { styleText } from "node:util";
import pkg from "../../package.json" with { type: "json" };
import { CONFIG_FILE, DEFAULT_REGISTRY, readConfig } from "../utils/config.ts";
import { allDeps, detectProject } from "../utils/detect.ts";
import { installedCheck } from "../utils/installed.ts";
import { fetchIndex } from "../utils/registry.ts";
import { CliError } from "../utils/ui.ts";

/** Prints a titled block of label: value rows. */
function section(title: string, rows: [string, string][]) {
  const width = Math.max(...rows.map(([label]) => label.length));
  console.log(`\n${styleText("bold", title)}`);
  for (const [label, value] of rows)
    console.log(`  ${styleText("dim", label.padEnd(width))}  ${value}`);
}

/** The CLI version, the project, cl.json and what's installed. */
export async function info(opts: { cwd: string }) {
  const root = path.resolve(opts.cwd);
  if (!existsSync(path.join(root, "package.json"))) {
    throw new CliError(`No package.json in ${root}. Run this in your project folder.`);
  }
  const project = await detectProject(root);
  const deps = allDeps(project.pkg);
  const config = await readConfig(root);
  const registry = config?.registry ?? DEFAULT_REGISTRY;

  section("Cladux", [
    ["CLI", pkg.version],
    ["Registry", registry],
  ]);
  section("Project", [
    ["Folder", root],
    ["Framework", project.framework],
    ["Package manager", project.packageManager],
    ["React", deps.react ?? "not installed"],
    ["Tailwind CSS", deps.tailwindcss ?? "not installed"],
    ["TypeScript", deps.typescript ?? "no"],
  ]);

  if (!config) {
    console.log(`\nNo ${CONFIG_FILE} here yet. Set it up with: cladux init`);
    return;
  }

  section(CONFIG_FILE, [
    ["Style", config.style],
    ["Globals CSS", config.css.globals],
    ...(config.style === "css" ? ([["CSS folder", config.css.dir]] as [string, string][]) : []),
    ["Theme", config.css.tokens ? "Cladux tokens" : "your own variables"],
  ]);
  section("Aliases", Object.entries(config.aliases));

  // What's installed needs the registry; the rest is still useful without it.
  const installed = await installedCheck(root, config);
  try {
    const index = await fetchIndex(registry);
    for (const [type, title] of [
      ["registry:ui", "Components"],
      ["registry:block", "Blocks"],
    ] as const) {
      const names = index.items.filter((i) => i.type === type && installed?.(i)).map((i) => i.name);
      console.log(`\n${styleText("bold", `${title} (${names.length})`)}`);
      console.log(names.length ? `  ${names.join(", ")}` : styleText("dim", "  none yet"));
    }
  } catch (error) {
    console.log(
      `\n${styleText("yellow", `Couldn't read the registry: ${(error as Error).message}`)}`,
    );
  }
}
