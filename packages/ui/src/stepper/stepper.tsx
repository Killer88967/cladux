"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

type StepState = "completed" | "active" | "inactive";

interface StepperContextValue {
  value: number;
  setValue: (value: number) => void;
  orientation: "horizontal" | "vertical";
  /** Steps can be clicked to jump to them. */
  interactive: boolean;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) throw new Error("useStepper must be used inside <Stepper>.");
  return context;
}

interface StepperItemContextValue {
  step: number;
  state: StepState;
  disabled: boolean;
  loading: boolean;
}

const StepperItemContext = React.createContext<StepperItemContextValue | null>(null);

function useStepperItem() {
  const context = React.useContext(StepperItemContext);
  if (!context) throw new Error("Stepper parts must be inside <StepperItem>.");
  return context;
}

function Stepper({
  className,
  value,
  defaultValue = 1,
  onValueChange,
  orientation = "horizontal",
  interactive = true,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** The active step, starting at 1. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  /** Let people click a step to go to it. */
  interactive?: boolean;
}) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const context = React.useMemo(
    () => ({ value: current, setValue: setCurrent, orientation, interactive }),
    [current, setCurrent, orientation, interactive],
  );

  return (
    <StepperContext.Provider value={context}>
      <div
        data-slot="stepper"
        data-orientation={orientation}
        aria-orientation={orientation}
        className={cn(
          "group/stepper flex w-full data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-start data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  );
}

function StepperItem({
  className,
  step,
  completed,
  disabled = false,
  loading = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** This step's number, starting at 1. */
  step: number;
  /** Mark the step done regardless of the active step. */
  completed?: boolean;
  disabled?: boolean;
  /** Show a spinner in the indicator. */
  loading?: boolean;
}) {
  const { value } = useStepper();
  const state: StepState =
    completed || step < value ? "completed" : step === value ? "active" : "inactive";

  return (
    <StepperItemContext.Provider value={{ step, state, disabled, loading }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        className={cn(
          "group/stepper-item relative flex group-data-[orientation=horizontal]/stepper:flex-1 group-data-[orientation=horizontal]/stepper:flex-col group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=vertical]/stepper:flex-row group-data-[orientation=vertical]/stepper:gap-3 group-data-[orientation=vertical]/stepper:not-last:pb-6 data-disabled:pointer-events-none data-disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </StepperItemContext.Provider>
  );
}

/** The clickable part of a step. Holds the indicator, title and description. */
function StepperTrigger({
  className,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"button">) {
  const { setValue, interactive, orientation } = useStepper();
  const { step, state, disabled } = useStepperItem();

  return (
    <button
      type="button"
      data-slot="stepper-trigger"
      data-state={state}
      aria-current={state === "active" ? "step" : undefined}
      disabled={disabled || !interactive}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setValue(step);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        // Arrow keys move focus between steps, like a toolbar.
        const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        if (![next, prev, "Home", "End"].includes(e.key)) return;
        const root = e.currentTarget.closest("[data-slot=stepper]");
        const triggers = [
          ...(root?.querySelectorAll<HTMLButtonElement>(
            "[data-slot=stepper-trigger]:not(:disabled)",
          ) ?? []),
        ];
        const at = triggers.indexOf(e.currentTarget);
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const forward = rtl && orientation === "horizontal" ? e.key === prev : e.key === next;
        const target =
          e.key === "Home"
            ? triggers[0]
            : e.key === "End"
              ? triggers.at(-1)
              : triggers[at + (forward ? 1 : -1)];
        if (target) {
          e.preventDefault();
          target.focus();
        }
      }}
      className={cn(
        "flex items-center gap-3 rounded-md text-start outline-none group-data-[orientation=horizontal]/stepper:flex-col group-data-[orientation=horizontal]/stepper:text-center group-data-[orientation=vertical]/stepper:items-start focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default",
        className,
      )}
      {...props}
    />
  );
}

function StepperIndicator({ className, children, ...props }: React.ComponentProps<"span">) {
  const { step, state, loading } = useStepperItem();

  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:ring-3 data-[state=active]:ring-primary/20 data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground dark:bg-input/30 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-label="Loading"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        (children ?? (state === "completed" ? <CheckIcon aria-label="Completed" /> : step))
      )}
    </span>
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-title"
      className={cn(
        "block text-sm font-medium group-data-[state=inactive]/stepper-item:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function StepperDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("block text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The line to the next step. Leave it out of the last item. */
function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-separator"
      aria-hidden
      className={cn(
        "absolute bg-border transition-colors group-data-[orientation=horizontal]/stepper:start-[calc(50%+1.5rem)] group-data-[orientation=horizontal]/stepper:end-[calc(-50%+1.5rem)] group-data-[orientation=horizontal]/stepper:top-4 group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=vertical]/stepper:start-[calc(1rem-0.5px)] group-data-[orientation=vertical]/stepper:top-10 group-data-[orientation=vertical]/stepper:bottom-2 group-data-[orientation=vertical]/stepper:w-px group-data-[state=completed]/stepper-item:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

export {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  useStepper,
};
