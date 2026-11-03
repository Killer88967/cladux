import path from "node:path";
import { styleText } from "node:util";
import { DEFAULT_REGISTRY, readConfig } from "../utils/config.ts";
import { fetchIndex } from "../utils/registry.ts";
import { installedCheck } from "../utils/installed.ts";
import { CliError } from "../utils/ui.ts";

export interface ListOptions {
  cwd: string;
  query?: string;
  registry?: string;
}

const GROUPS = [
  ["registry:ui", "Components"],
  ["registry:block", "Blocks"],
] as const;

/** `list` shows every component and block; `search` only the ones that match. */
export async function list(opts: ListOptions) {
  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  const index = await fetchIndex(opts.registry ?? config?.registry ?? DEFAULT_REGISTRY);

  // Inside a project, mark what's already installed.
  const installed = await installedCheck(root, config);

  const query = opts.query?.toLowerCase();
  const matches = index.items.filter(
    (i) => !query || i.name.includes(query) || i.description?.toLowerCase().includes(query),
  );

  const columns = process.stdout.columns ?? 80;
  let shown = 0;
  for (const [type, title] of GROUPS) {
    const items = matches.filter((i) => i.type === type);
    if (!items.length) continue;
    shown += items.length;

    const width = Math.max(...items.map((i) => i.name.length));
    console.log(`\n${styleText("bold", `${title} (${items.length})`)}`);
    for (const item of items) {
      const mark = installed?.(item) ? styleText("green", "●") : " ";
      const tag = item.new ? styleText("yellow", "new") : "   ";
      const start = `${mark} ${item.name.padEnd(width)}  ${tag}  `;
      // One line per item: cut the description to fit the terminal.
      const room = columns - width - 9;
      let text = item.description ?? "";
      if (text.length > room) text = `${text.slice(0, Math.max(room - 1, 0))}…`;
      console.log(start + styleText("dim", text));
    }
  }

  if (!shown) throw new CliError(`Nothing matches "${opts.query}".`);
  console.log(
    `\n${installed ? `${styleText("green", "●")} installed   ` : ""}Add one with: cladux add <name>`,
  );
}
