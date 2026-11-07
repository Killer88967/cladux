import { readFile } from "node:fs/promises";
import path from "node:path";
import { ComponentPreviewTabs } from "@/components/component-preview-tabs";
import { highlight } from "@/lib/highlight";

// HTML demos live in the styles package; keep Turbopack from tracing the whole repo.
const EXAMPLES = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "../../packages/styles/examples",
);

/** Live preview of a plain-HTML demo, with its markup in the Code tab. */
export async function HtmlPreview({ name }: { name: string }) {
  const source = (await readFile(path.join(EXAMPLES, `${name}.html`), "utf8")).trim();
  const html = await highlight(source, "html");

  return (
    <ComponentPreviewTabs
      preview={<div className="contents" dangerouslySetInnerHTML={{ __html: source }} />}
      code={source}
      html={html}
    />
  );
}
