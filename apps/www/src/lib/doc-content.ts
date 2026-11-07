import type { ComponentType } from "react";
import type { DocMeta } from "@/lib/docs";

// Kept apart from lib/docs.ts on purpose: this import() reaches every doc, and with
// it every demo. Only the docs page may import this file. If the header could reach
// it (through getNav), every page on the site would bundle every component.

export async function getDoc(slug: string[]) {
  const base = slug.join("/");
  const candidates = base ? [base, `${base}/index`] : ["index"];

  for (const file of candidates) {
    try {
      const mod = await import(`@/content/docs/${file}.mdx`);
      return { Content: mod.default as ComponentType, metadata: mod.metadata as DocMeta };
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}
