"use client";

import { RichTextEditor } from "@cladux/ui";

export default function RichTextEditorDemo() {
  return (
    <RichTextEditor
      className="max-w-2xl"
      defaultValue="<h2>Release notes</h2><p>This release adds a <strong>rich text editor</strong> with a toolbar, links and <code>inline code</code>.</p><ul><li><p>Keyboard shortcuts work too</p></li><li><p>Try <em>Ctrl+B</em> or ⌘B</p></li></ul>"
    />
  );
}
