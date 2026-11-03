import path from "node:path";
import { styleText } from "node:util";
import { DEFAULT_REGISTRY, readConfig } from "../utils/config.ts";
import { rewriteImports } from "../utils/files.ts";
import { fetchItem, NotFoundError } from "../utils/registry.ts";
import { CliError } from "../utils/ui.ts";

export interface ViewOptions {
  cwd: string;
  names: string[];
  registry?: string;
  style?: string;
}

/** Prints an item's files without installing anything. */
export async function view(opts: ViewOptions) {
  if (!opts.names.length) throw new CliError("Which item? e.g. view button");

  const root = path.resolve(opts.cwd);
  const config = await readConfig(root);
  const registry = opts.registry ?? config?.registry ?? DEFAULT_REGISTRY;
  const style = opts.style ?? config?.style ?? "tailwind";
  if (style !== "tailwind" && style !== "css") {
    throw new CliError(`Unknown style "${style}". Use tailwind or css.`);
  }

  for (const name of opts.names) {
    const item = await fetchItem(registry, style, name).catch((error: unknown) => {
      if (error instanceof NotFoundError) {
        throw new CliError(`"${name}" isn't in the registry. Try: cladux search ${name}`);
      }
      throw error;
    });

    const kind = item.type.replace("registry:", "");
    console.log(
      `\n${styleText("bold", item.name)}  ${styleText("dim", `${kind}, ${style} style`)}`,
    );
    if (item.description) console.log(item.description);
    if (item.registryDependencies.length) {
      console.log(`${styleText("dim", "Needs:")} ${item.registryDependencies.join(", ")}`);
    }
    if (item.dependencies.length) {
      console.log(`${styleText("dim", "Packages:")} ${item.dependencies.join(", ")}`);
    }

    for (const file of item.files) {
      // In a project, show the imports the way add would write them.
      const content =
        config && file.type !== "css" ? rewriteImports(file.content, config) : file.content;
      console.log(`\n${styleText("cyan", `── ${file.path}`)}\n${content.trimEnd()}`);
    }
  }
}
