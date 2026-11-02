"use client";

import {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorFooter,
  RichTextEditorLink,
  RichTextEditorSeparator,
  RichTextEditorToggle,
  RichTextEditorToolbar,
} from "@cladux/ui";

export default function RichTextEditorCustom() {
  return (
    <RichTextEditor className="max-w-lg" placeholder="Leave a comment…">
      <RichTextEditorContent className="min-h-24" />
      <RichTextEditorToolbar className="border-t border-b-0">
        <RichTextEditorToggle format="bold" />
        <RichTextEditorToggle format="italic" />
        <RichTextEditorToggle format="code" />
        <RichTextEditorSeparator />
        <RichTextEditorToggle format="bulletList" />
        <RichTextEditorLink />
      </RichTextEditorToolbar>
      <RichTextEditorFooter />
    </RichTextEditor>
  );
}
