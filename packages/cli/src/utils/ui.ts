import * as p from "@clack/prompts";

/** An error meant for the user: printed without a stack trace. */
export class CliError extends Error {}

/** Unwraps a prompt answer, exiting cleanly if the user pressed Ctrl+C. */
export function answer<T>(value: T | symbol): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value as Exclude<T, symbol>;
}

/** How to run the CLI again, matching the user's package manager. */
export function runCommand(pm: string, args: string) {
  const runner = { pnpm: "pnpm dlx", yarn: "yarn dlx", bun: "bunx --bun", npm: "npx" }[pm] ?? "npx";
  return `${runner} cladux@latest ${args}`;
}
