import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";
import { CONFIG_FILE, readConfig, writeConfig } from "../utils/config.ts";
import { loadTheme } from "../utils/theme.ts";
import { CliError } from "../utils/ui.ts";

export interface ApplyOptions {
  cwd: string;
  code?: string;
}

/**
 * `apply zinc-violet` rewrites cl-tokens.css with a theme from /themes, and
 * saves the code in cl.json. `update` leaves cl-tokens.css alone, so it stays.
 */
export async function apply(opts: ApplyOptions) {
  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  if (!config) throw new CliError(`No ${CONFIG_FILE} here. Run init first.`);
  if (!opts.code) {
    throw new CliError(
      "Which theme? e.g. cladux apply zinc-violet. Make one at https://cladux.vercel.app/themes",
    );
  }

  const theme = await loadTheme(opts.code, config.registry, config.style);
  if (config.css.tokens) {
    const file = path.join(config.css.dir, "cl-tokens.css");
    await mkdir(path.join(root, config.css.dir), { recursive: true });
    await writeFile(path.join(root, file), theme.css);
    p.log.success(`Applied ${theme.code} to ${file}`);
  } else {
    // The project keeps the variables in its own stylesheet, as shadcn projects do.
    p.log.info(
      `${config.css.globals} defines the theme variables itself. Replace them with:\n\n${theme.css}`,
    );
  }
  await writeConfig(root, { ...config, theme: theme.code });
}
