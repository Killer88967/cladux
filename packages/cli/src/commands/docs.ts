import path from "node:path";
import { styleText } from "node:util";
import { DEFAULT_REGISTRY, readConfig } from "../utils/config.ts";
import { fetchDocs, NotFoundError } from "../utils/registry.ts";
import { CliError } from "../utils/ui.ts";

export interface DocsOptions {
  cwd: string;
  names: string[];
  registry?: string;
}

/** Prints a component's docs page in the terminal, with a link to the full page. */
export async function docs(opts: DocsOptions) {
  if (!opts.names.length) throw new CliError("Which component? e.g. docs button");

  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  const registry = opts.registry ?? config?.registry ?? DEFAULT_REGISTRY;

  for (const name of opts.names) {
    let markdown: string;
    try {
      markdown = await fetchDocs(registry, name);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new CliError(`No docs for "${name}". Try: cladux search ${name}`);
      }
      throw error;
    }
    // The examples import from the package; in a project, show your own path.
    if (config) {
      markdown = markdown.replaceAll(
        'from "@cladux/ui"',
        `from "${config.aliases.components}/${name}"`,
      );
    }
    console.log(`\n${render(markdown)}`);

    // The site lives where the registry does, minus the /r.
    if (/^https?:\/\/.+\/r\/?$/.test(registry)) {
      const site = registry.replace(/\/r\/?$/, "");
      console.log(
        `\n${styleText("dim", "Examples and previews:")} ${site}/docs/components/${name}`,
      );
    }
  }
}

/** Just enough Markdown for a terminal: headings, code blocks, `code` and **bold**. */
function render(markdown: string) {
  let inCode = false;
  const lines: string[] = [];
  for (const line of markdown.trimEnd().split("\n")) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      const lang = line.slice(3).trim();
      if (inCode && lang) lines.push(styleText("dim", `  ${lang}`));
    } else if (inCode) {
      lines.push(styleText("cyan", `  ${line}`));
    } else if (/^#{1,3} /.test(line)) {
      const text = line.replace(/^#+ /, "");
      // The page title is underlined too. (Nested calls: arrays need Node 22.13+.)
      lines.push(styleText("bold", line.startsWith("# ") ? styleText("underline", text) : text));
    } else if (line.startsWith("|")) {
      // Tables keep their backticks so the columns stay lined up.
      lines.push(line.replace(/`[^`]+`/g, (code) => styleText("cyan", code)));
    } else {
      lines.push(
        line
          .replace(/`([^`]+)`/g, (_, code: string) => styleText("cyan", code))
          .replace(/\*\*([^*]+)\*\*/g, (_, text: string) => styleText("bold", text)),
      );
    }
  }
  return lines.join("\n");
}
