"use client";

import * as React from "react";
import { RichTextEditor } from "@cladux/ui";

export default function RichTextEditorControlled() {
  const [html, setHtml] = React.useState("<p>Type here and watch the HTML update.</p>");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <RichTextEditor value={html} onValueChange={setHtml} />
      <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
        {html}
      </pre>
    </div>
  );
}
