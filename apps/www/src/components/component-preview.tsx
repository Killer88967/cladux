import { readFile } from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";
import { ComponentPreviewTabs } from "@/components/component-preview-tabs";
import { Demo } from "@/components/demos.generated";
import { exampleFiles } from "@/lib/examples";

// Examples live outside the app; keep Turbopack from tracing the whole repo.
const REPO_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "../..");

interface ComponentPreviewProps {
  name: string;
  /** Where the demo sits in the preview box, like shadcn's docs. */
  align?: "center" | "start" | "end";
  /** Extra classes for the preview box, e.g. a fixed height. */
  previewClassName?: string;
  /** Render the demo in the browser only, for demos that depend on today's date. */
  clientOnly?: boolean;
}

export async function ComponentPreview({
  name,
  align,
  previewClassName,
  clientOnly,
}: ComponentPreviewProps) {
  const file = exampleFiles[name];
  if (!file) throw new Error(`Unknown example "${name}}`);

  const source = (await readFile(path.join(REPO_ROOT, file), "utf8")).trim();
  const html = await codeToHtml(source, {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
  });

  return (
    <ComponentPreviewTabs
      preview={<Demo name={name} />}
      code={source}
      html={html}
      align={align}
      previewClassName={previewClassName}
      clientOnly={clientOnly}
    />
  );
}
