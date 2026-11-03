import path from "node:path";
import { styleText } from "node:util";
import * as p from "@clack/prompts";
import { readConfig } from "../utils/config.ts";
import { CliError } from "../utils/ui.ts";
import { validateRegistry, type Issue } from "../utils/validate.ts";

export interface RegistryValidateOptions {
  cwd: string;
  /** A registry URL or folder. */
  source?: string;
}

/** `cladux registry validate`: checks a registry before you publish it. */
export async function registryValidate(opts: RegistryValidateOptions) {
  const root = path.resolve(opts.cwd);
  const source = opts.source ?? (await readConfig(root))?.registry;
  if (!source) throw new CliError("Which registry? e.g. cladux registry validate ./public/r");
  const registry = /^https?:\/\//.test(source) ? source : path.resolve(root, source);

  p.intro("Cladux");
  const spin = p.spinner();
  spin.start(`Checking ${source}`);
  const { issues, checked } = await validateRegistry(registry);
  spin.stop(`Checked index.json and ${checked} item file${checked === 1 ? "" : "s"}`);

  // One block per file, errors first.
  const byFile = new Map<string, Issue[]>();
  for (const issue of issues.toSorted(
    (a, b) => Number(a.level === "warning") - Number(b.level === "warning"),
  )) {
    byFile.set(issue.file, [...(byFile.get(issue.file) ?? []), issue]);
  }
  for (const [file, list] of byFile) {
    const lines = list.map((i) =>
      i.level === "error"
        ? `${styleText("red", "error")}   ${i.message}`
        : `${styleText("yellow", "warning")} ${i.message}`,
    );
    p.log.message(`${styleText("bold", file)}\n${lines.join("\n")}`);
  }

  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.length - errors;
  const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  if (errors) throw new CliError(`${count(errors, "error")}, ${count(warnings, "warning")}.`);
  p.outro(warnings ? `Valid, with ${count(warnings, "warning")}.` : "Valid. Ready to publish.");
}
