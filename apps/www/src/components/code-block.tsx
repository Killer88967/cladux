"use client";

import * as React from "react";
import { cn } from "@cladux/utils";
import { CopyButton } from "@/components/copy-button";

/** Replaces MDX's <pre>: same markup, plus a copy button in the corner. */
export function CodeBlock({ className, ...props }: React.ComponentProps<"pre">) {
  const ref = React.useRef<HTMLPreElement>(null);

  return (
    <div className="relative my-6 rounded-lg border bg-muted/50">
      <pre
        ref={ref}
        className={cn(
          "max-h-120 overflow-auto p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0",
          className,
        )}
        {...props}
      />
      <CopyButton value={() => ref.current?.innerText ?? ""} className="absolute top-2 right-2" />
    </div>
  );
}
