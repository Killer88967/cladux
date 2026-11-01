"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@cladux/ui";
import { cn } from "@cladux/utils";

interface CopyButtonProps extends Omit<React.ComponentProps<typeof Button>, "value"> {
  /** Text to copy, or a function that returns it when clicked. */
  value: string | (() => string);
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(typeof value === "function" ? value() : value);
    setCopied(true);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={copy}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}
