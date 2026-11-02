"use client";

import { CopyButton } from "@/components/copy-button";

/** A one-line command with a copy button, for the home page. */
export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 py-1 ps-3 pe-1 font-mono text-sm">
      <span className="text-muted-foreground select-none">$</span>
      <span>{command}</span>
      <CopyButton value={command} aria-label="Copy command" />
    </div>
  );
}
