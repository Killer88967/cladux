import { parseArgs } from "node:util";
import * as p from "@clack/prompts";
import { init } from "./commands/init.ts";
import { add } from "./commands/add.ts";
import { CliError } from "./utils/ui.ts";

const HELP = `Usage: cladux <command> [options]

Commands
  init                Set up cl.json, the theme and the cn() helper
  add [components...] Add components (pick from a list if none are named)

Options
  -c, --cwd           Project folder (default: current folder)
  -y, --yes           Use the defaults, no questions
  --skip-install      Don't install npm packages
  -h, --help          Show this help

init
  -f, --force         Overwrite an existing cl.json
  --style             tailwind | css (default: detected)
  --registry          Registry URL or folder

add
  -a, --all           Add every component
  -o, --overwrite     Replace files that already exist

Examples
  cladux init
  cladux add button card dialog`;

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      cwd: { type: "string", short: "c", default: process.cwd() },
      yes: { type: "boolean", short: "y", default: false },
      force: { type: "boolean", short: "f", default: false },
      all: { type: "boolean", short: "a", default: false },
      overwrite: { type: "boolean", short: "o", default: false },
      style: { type: "string" },
      registry: { type: "string" },
      "skip-install": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  const [command, ...rest] = positionals;
  if (values.help || !command) return console.log(HELP);

  switch (command) {
    case "init":
      return init({
        cwd: values.cwd,
        yes: values.yes,
        force: values.force,
        skipInstall: values["skip-install"],
        style: values.style,
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
  p.log.error(show);
  process.exit(1);
});
