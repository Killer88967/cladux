import { parseArgs } from "node:util";
import * as p from "@clack/prompts";
import { init } from "./commands/init.ts";
import { add } from "./commands/add.ts";
import { list } from "./commands/list.ts";
import { view } from "./commands/view.ts";
import { info } from "./commands/info.ts";
import { diff } from "./commands/diff.ts";
import { update } from "./commands/update.ts";
import { docs } from "./commands/docs.ts";
import { registryValidate } from "./commands/registry.ts";
import { build } from "./commands/build.ts";
import { apply } from "./commands/apply.ts";
import pkg from "../package.json" with { type: "json" };
import { CliError, output } from "./utils/ui.ts";

const HELP = `Usage: cladux <command> [options]

Commands
  init                Set up cl.json, the theme and the cn() helper
  add [components...] Add components (pick from a list if none are named)
  list                List every component and block
  search <query>      Find components and blocks by name or description
  view <names...>     Show an item's files without installing it
  docs <names...>     Show a component's docs in the terminal
  info                Show the project setup and what's installed
  diff                Compare your components with the registry
  update [names...]   Update components, keeping the files you changed
  apply <theme>       Apply a theme code from cladux.vercel.app/themes
  mcp                 Start an MCP server for AI assistants (stdio)
  build [source]      Turn your components into a registry (reads cl-registry.json)
  registry validate [source]
                      Check a registry folder or URL before you publish it

Options
  -c, --cwd           Project folder (default: current folder)
  -y, --yes           Use the defaults, no questions
  -s, --silent        No output (implies --yes)
  --registry          Registry URL or folder
  --skip-install      Don't install npm packages
  -h, --help          Show this help
  -v, --version       Show the CLI version

init
  -f, --force         Overwrite an existing cl.json
  --style             tailwind | css (default: detected)
  --theme             A theme code, such as zinc-violet

add
  -a, --all           Add every component
  -o, --overwrite     Replace files that already exist
  --dry-run           Show what would be added, write nothing
  --view              List --dry-run, and print the files
  --diff              Like --dry-run, and show changes to existing files
  -p, --path          Put what you named in this folder instead

update
  -f, --force         Also replace files you changed
  --dry-run           Show what would change, write nothing

view
  --style             tailwind | css (default: from cl.json, else tailwind)

Examples
  cladux init
  cladux add button card dialog
  cladux apply zinc-violet
  cladux search date`;

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      cwd: { type: "string", short: "c", default: process.cwd() },
      yes: { type: "boolean", short: "y", default: false },
      force: { type: "boolean", short: "f", default: false },
      all: { type: "boolean", short: "a", default: false },
      overwrite: { type: "boolean", short: "o", default: false },
      "dry-run": { type: "boolean", default: false },
      view: { type: "boolean", default: false },
      diff: { type: "boolean", default: false },
      path: { type: "string", short: "p" },
      silent: { type: "boolean", short: "s", default: false },
      style: { type: "string" },
      theme: { type: "string" },
      registry: { type: "string" },
      "skip-install": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });

  const [command, ...rest] = positionals;
  if (values.silent) {
    output.silent = true;
    values.yes = true;
    process.stdout.write = (() => true) as typeof process.stdout.write;
  }
  if (values.version) return console.log(pkg.version);
  if (values.help || !command) return console.log(HELP);

  switch (command) {
    case "init":
      return init({
        cwd: values.cwd,
        yes: values.yes,
        force: values.force,
        skipInstall: values["skip-install"],
        style: values.style,
        theme: values.theme,
        registry: values.registry,
      });
    case "add":
      return add({
        cwd: values.cwd,
        names: rest,
        yes: values.yes,
        all: values.all,
        overwrite: values.overwrite,
        skipInstall: values["skip-install"],
        dryRun: values["dry-run"],
        view: values.view,
        diff: values.diff,
        path: values.path,
      });
    case "list":
      return list({ cwd: values.cwd, registry: values.registry });
    case "search":
      if (!rest.length) throw new CliError("What should I search for? e.g. search date");
      return list({ cwd: values.cwd, registry: values.registry, query: rest.join(" ") });
    case "view":
      return view({
        cwd: values.cwd,
        names: rest,
        registry: values.registry,
        style: values.style,
      });
    case "docs":
      return docs({ cwd: values.cwd, names: rest, registry: values.registry });
    case "build":
      return build({ cwd: values.cwd, source: rest[0] });
    case "registry":
      if (rest[0] !== "validate") {
        throw new CliError("Usage: cladux registry validate [folder or URL]");
      }
      return registryValidate({ cwd: values.cwd, source: rest[1] ?? values.registry });
    case "apply":
      return apply({ cwd: values.cwd, code: rest[0] });
    case "mcp": {
      const { mcp } = await import("./commands/mcp.ts");
      return mcp({ cwd: values.cwd });
    }
    case "info":
      return info({ cwd: values.cwd });
    case "diff":
      return diff({ cwd: values.cwd, names: rest });
    case "update":
      return update({
        cwd: values.cwd,
        names: rest,
        force: values.force,
        dryRun: values["dry-run"],
        skipInstall: values["skip-install"],
      });
    default:
      throw new CliError(`Unknown command "${command}".\n\n${HELP}`);
  }
}

main().catch((error: unknown) => {
  // Expected problems get a plain message; set DEBUG=1 for the stack of anything else.
  const show =
    error instanceof Error && (error instanceof CliError || !process.env.DEBUG)
      ? error.message
      : error instanceof Error
        ? (error.stack ?? error.message)
        : String(error);
  if (output.silent) process.stdout.write(`${show}\n`);
  p.log.error(show);
  process.exit(1);
});
