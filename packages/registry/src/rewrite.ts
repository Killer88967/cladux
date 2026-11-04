import { REGISTRY_ALIASES, type Aliases } from "./registry.ts";

/**
 * Swaps the import paths registry files are written with (@/components/cl/...)
 * for a project's own, so the files work once they're written there.
 */
export function rewriteImports(content: string, aliases: Aliases) {
  const pairs: [string, string][] = [
    // utils first: it sits under lib/, so it has to win over the lib rule.
    [`"${REGISTRY_ALIASES.utils}"`, `"${aliases.utils}"`],
    [`"${REGISTRY_ALIASES.components}/`, `"${aliases.components}/`],
    [`"${REGISTRY_ALIASES.hooks}/`, `"${aliases.hooks}/`],
    [`"${REGISTRY_ALIASES.lib}/`, `"${aliases.lib}/`],
  ];
  return content.replace(/"@\/[^"]*"/g, (spec) => {
    for (const [from, to] of pairs) {
      if (spec.startsWith(from)) return to + spec.slice(from.length);
    }
    return spec;
  });
}
