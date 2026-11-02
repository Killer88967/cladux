"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

interface TagsInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** The most tags allowed. The input hides once it is reached. */
  max?: number;
  /** Keys that turn the typed text into a tag. Enter always does. */
  delimiters?: string[];
  allowDuplicates?: boolean;
  /** Return false to reject a tag, or a string to change it. */
  validate?: (tag: string, tags: string[]) => boolean | string;
  /** Add the typed text as a tag when the input loses focus. */
  addOnBlur?: boolean;
}

function TagsInput({
  className,
  value,
  defaultValue = [],
  onValueChange,
  max = Number.POSITIVE_INFINITY,
  delimiters = [","],
  allowDuplicates = false,
  validate,
  addOnBlur = true,
  disabled,
  placeholder,
  id,
  onKeyDown,
  onBlur,
  onPaste,
  ...props
}: TagsInputProps) {
  const [tags, setTags] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const tagRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const add = (raw: string[]) => {
    const next = [...tags];
    for (const text of raw) {
      let tag = text.trim();
      if (!tag || next.length >= max) continue;
      if (validate) {
        const result = validate(tag, next);
        if (result === false) continue;
        if (typeof result === "string") tag = result;
      }
      if (!allowDuplicates && next.includes(tag)) continue;
      next.push(tag);
    }
    if (next.length !== tags.length) setTags(next);
    return next.length !== tags.length;
  };

  const removeAt = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    // Keep focus inside: the previous tag, or the input when none is left.
    requestAnimationFrame(() => {
      const target = tagRefs.current[Math.max(0, index - 1)];
      (tags.length > 1 && index > 0 && target ? target : inputRef.current)?.focus();
    });
  };

  const full = tags.length >= max;

  return (
    <div
      data-slot="tags-input"
      data-disabled={disabled || undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) inputRef.current?.focus();
      }}
      className={cn(
        "flex min-h-8 w-full min-w-0 cursor-text flex-wrap items-center gap-1 rounded-lg border border-input px-1 py-[3px] transition-colors outline-none has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          data-slot="tags-input-tag"
          className="inline-flex h-6 max-w-full min-w-0 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-2 text-xs font-medium text-secondary-foreground"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            ref={(el) => {
              tagRefs.current[index] = el;
            }}
            data-slot="tags-input-remove"
            aria-label={`Remove ${tag}`}
            disabled={disabled}
            onClick={() => removeAt(index)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();
                removeAt(index);
              } else if (e.key === "ArrowLeft") {
                tagRefs.current[index - 1]?.focus();
              } else if (e.key === "ArrowRight") {
                (tagRefs.current[index + 1] ?? inputRef.current)?.focus();
              }
            }}
            className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3"
          >
            <XIcon />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        data-slot="tags-input-input"
        autoComplete="off"
        disabled={disabled}
        hidden={full}
        placeholder={tags.length ? undefined : placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || e.nativeEvent.isComposing) return;
          if (e.key === "Enter" || delimiters.includes(e.key)) {
            if (!draft.trim()) {
              if (e.key !== "Enter") e.preventDefault();
              return;
            }
            e.preventDefault();
            add([draft]);
            setDraft("");
          } else if (e.key === "Backspace" && !draft && tags.length) {
            e.preventDefault();
            setTags(tags.slice(0, -1));
          } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
            tagRefs.current[tags.length - 1]?.focus();
          }
        }}
        onPaste={(e) => {
          onPaste?.(e);
          if (e.defaultPrevented) return;
          const text = e.clipboardData.getData("text");
          const split = new RegExp(
            `[\\n\\t${delimiters.map((d) => d.replace(/[\\\]^-]/g, "\\$&")).join("")}]`,
          );
          if (!split.test(text)) return;
          e.preventDefault();
          add(text.split(split));
        }}
        onBlur={(e) => {
          onBlur?.(e);
          if (addOnBlur && draft.trim()) {
            add([draft]);
            setDraft("");
          }
        }}
        className="h-6 min-w-16 flex-1 bg-transparent px-1.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        {...props}
      />
    </div>
  );
}

export { TagsInput };
export type { TagsInputProps };
