"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

interface NumberInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Multiplier for PageUp / PageDown and Shift+Arrow. */
  largeStep?: number;
}

function NumberInput({
  className,
  value,
  defaultValue = null,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  largeStep = 10,
  disabled,
  onBlur,
  onKeyDown,
  ...props
}: NumberInputProps) {
  const [current, setCurrent] = useControllableState<number | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [draft, setDraft] = React.useState<string | null>(null);
  const precision = Math.max(decimals(step), decimals(Number.isFinite(min) ? min : 0));

  const clamp = (n: number) => Math.min(max, Math.max(min, Number(n.toFixed(precision))));
  const commit = (n: number | null) => setCurrent(n === null ? null : clamp(n));
  const nudge = (delta: number) => commit((current ?? (Number.isFinite(min) ? min : 0)) + delta);

  // Holding a button repeats, like a native spinner.
  const repeat = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = React.useRef(nudge);
  latest.current = nudge;
  const stopRepeat = () => clearTimeout(repeat.current);
  const startRepeat = (delta: number) => {
    // The button can become disabled mid-hold (at min/max), so listen on window.
    window.addEventListener("pointerup", stopRepeat, { once: true });
    window.addEventListener("pointercancel", stopRepeat, { once: true });
    latest.current(delta);
    const tick = (delay: number) => {
      repeat.current = setTimeout(() => {
        latest.current(delta);
        tick(50);
      }, delay);
    };
    tick(400);
  };
  React.useEffect(() => stopRepeat, []);

  const atMin = current !== null && current <= min;
  const atMax = current !== null && current >= max;

  return (
    <div
      data-slot="number-input"
      data-disabled={disabled || undefined}
      className={cn(
        "flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50",
        className,
      )}
    >
      <button
        type="button"
        data-slot="number-input-decrement"
        aria-label="Decrease"
        tabIndex={-1}
        disabled={disabled || atMin}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          startRepeat(-step);
        }}
        onPointerLeave={stopRepeat}
        className="flex h-full w-8 shrink-0 items-center justify-center rounded-s-[calc(var(--radius)-1px)] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5"
      >
        <MinusIcon />
      </button>
      <input
        type="text"
        inputMode={precision > 0 || min < 0 ? "decimal" : "numeric"}
        role="spinbutton"
        data-slot="number-input-input"
        aria-valuenow={current ?? undefined}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        autoComplete="off"
        disabled={disabled}
        value={draft ?? (current === null ? "" : String(current))}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => {
          if (draft !== null) {
            const parsed = draft.trim() === "" ? null : Number(draft.replace(",", "."));
            // Empty clears the value; anything that isn't a number puts the last one back.
            commit(parsed !== null && Number.isNaN(parsed) ? current : parsed);
            setDraft(null);
          }
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          const keys: Record<string, () => void> = {
            ArrowUp: () => nudge(step * (e.shiftKey ? largeStep : 1)),
            ArrowDown: () => nudge(-step * (e.shiftKey ? largeStep : 1)),
            PageUp: () => nudge(step * largeStep),
            PageDown: () => nudge(-step * largeStep),
            Home: () => Number.isFinite(min) && commit(min),
            End: () => Number.isFinite(max) && commit(max),
            Enter: () => e.currentTarget.blur(),
          };
          const action = keys[e.key];
          if (action) {
            e.preventDefault();
            setDraft(null);
            action();
          }
          onKeyDown?.(e);
        }}
        className="h-full w-full min-w-0 bg-transparent px-1 text-center text-base tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        {...props}
      />
      <button
        type="button"
        data-slot="number-input-increment"
        aria-label="Increase"
        tabIndex={-1}
        disabled={disabled || atMax}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          startRepeat(step);
        }}
        onPointerLeave={stopRepeat}
        className="flex h-full w-8 shrink-0 items-center justify-center rounded-e-[calc(var(--radius)-1px)] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export { NumberInput };
export type { NumberInputProps };
