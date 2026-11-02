"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { Button } from "../button/button";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";

function CopyButton({
  value,
  onCopy,
  timeout = 2000,
  variant = "ghost",
  size = "icon-sm",
  label = "Copy",
  copiedLabel = "Copied",
  className,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value"> & {
  /** The text to copy, or a function that returns it when clicked. */
  value: string | (() => string);
  onCopy?: (value: string) => void;
  /** How long the check shows, in ms. */
  timeout?: number;
  label?: string;
  copiedLabel?: string;
}) {
  const { copied, copy } = useCopyToClipboard({ timeout });
  const hasText = children !== undefined;

  return (
    <>
      <Button
        data-slot="copy-button"
        data-copied={copied || undefined}
        variant={variant}
        size={hasText && size === "icon-sm" ? "sm" : size}
        aria-label={hasText ? undefined : copied ? copiedLabel : label}
        className={cn("group/copy-button", className)}
        onClick={async (e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          const text = typeof value === "function" ? value() : value;
          if (await copy(text)) onCopy?.(text);
        }}
        {...props}
      >
        <span className="grid shrink-0 place-items-center *:col-start-1 *:row-start-1 [&_svg]:transition-all [&_svg]:duration-200">
          <CopyIcon className="group-data-copied/copy-button:scale-50 group-data-copied/copy-button:opacity-0" />
          <CheckIcon className="scale-50 opacity-0 group-data-copied/copy-button:scale-100 group-data-copied/copy-button:opacity-100" />
        </span>
        {hasText && (copied ? copiedLabel : children)}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}

export { CopyButton };
