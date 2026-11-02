"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import { Portal } from "radix-ui";

import { Button } from "../button/button";
import { Popover, PopoverAnchor, PopoverContent } from "../popover/popover";
import { useControllableState } from "../hooks/use-controllable-state";

interface TourStep {
  /** A CSS selector, a ref, or a function returning the element. Leave it out for a centered step. */
  target?: string | React.RefObject<Element | null> | (() => Element | null);
  title: React.ReactNode;
  content?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Space around the highlighted element, in px. */
  padding?: number;
}

interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The current step, starting at 0. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called when the last step's button is pressed. */
  onComplete?: () => void;
  /** Close when the dimmed area is clicked. */
  closeOnOverlayClick?: boolean;
  labels?: { next?: string; back?: string; done?: string; skip?: string; of?: string };
  className?: string;
}

function resolve(target: TourStep["target"]) {
  if (!target) return null;
  if (typeof target === "string") return document.querySelector(target);
  if (typeof target === "function") return target();
  return target.current;
}

const sameRect = (a: DOMRect | null, b: DOMRect | null) =>
  a === b ||
  (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

/**
 * Walks people through a page one element at a time: the element is cut out of
 * a dimmed overlay and a card next to it explains it.
 */
function Tour({
  steps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onComplete,
  closeOnOverlayClick = false,
  labels,
  className,
}: TourProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [index, setIndex] = useControllableState({
    value: stepProp,
    defaultValue: defaultStep,
    onChange: onStepChange,
  });
  const text = { next: "Next", back: "Back", done: "Done", skip: "Skip tour", of: "of", ...labels };
  const step = steps[Math.min(index, steps.length - 1)];
  const last = index >= steps.length - 1;
  const titleId = React.useId();
  const nextRef = React.useRef<HTMLButtonElement>(null);

  const [element, setElement] = React.useState<Element | null>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });

  // Find the step's element and bring it into view.
  React.useEffect(() => {
    if (!open || !step) return;
    const el = resolve(step.target);
    setElement(el);
    if (el) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [open, step, index]);

  // Follow the element as the page scrolls, resizes or animates.
  React.useEffect(() => {
    if (!open) return;
    let frame = 0;
    const loop = () => {
      const next = element?.getBoundingClientRect() ?? null;
      setRect((prev) => (sameRect(prev, next) ? prev : next));
      setViewport((prev) =>
        prev.width === window.innerWidth && prev.height === window.innerHeight
          ? prev
          : { width: window.innerWidth, height: window.innerHeight },
      );
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [open, element]);

  // Move focus to the main button on every step, for keyboard users.
  React.useEffect(() => {
    if (open) requestAnimationFrame(() => nextRef.current?.focus({ preventScroll: true }));
  }, [open, index]);

  const close = () => setOpen(false);
  const go = (to: number) => {
    if (to >= steps.length) {
      onComplete?.();
      close();
      setIndex(0);
    } else if (to >= 0) setIndex(to);
  };

  // Escape closes, the arrow keys step through.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const virtualRef = React.useMemo(
    () => ({
      current: {
        getBoundingClientRect: () => {
          const r = element?.getBoundingClientRect();
          const pad = step?.padding ?? 8;
          return r
            ? new DOMRect(r.x - pad, r.y - pad, r.width + pad * 2, r.height + pad * 2)
            : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0);
        },
      },
    }),
    [element, step],
  );

  if (!open || !step || typeof document === "undefined") return null;

  const pad = step.padding ?? 8;
  const hole = rect && {
    x: rect.x - pad,
    y: rect.y - pad,
    w: rect.width + pad * 2,
    h: rect.height + pad * 2,
  };
  const r = 8;
  const { width: W, height: H } = viewport;
  // The overlay is one path with a rounded hole; even-odd filling leaves the hole
  // unpainted, so the highlighted element can still be clicked.
  const d = hole
    ? `M0 0H${W}V${H}H0Z M${hole.x + r} ${hole.y}h${hole.w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${hole.h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${hole.w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${hole.h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}Z`
    : `M0 0H${W}V${H}H0Z`;

  const card = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div id={titleId} data-slot="tour-title" className="font-medium">
          {step.title}
        </div>
        <button
          type="button"
          aria-label={text.skip}
          onClick={close}
          className="-me-1 -mt-1 flex size-6 shrink-0 items-center justify-center rounded-[min(var(--radius-md),10px)] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5"
        >
          <XIcon />
        </button>
      </div>
      {step.content && (
        <div data-slot="tour-content" className="text-muted-foreground">
          {step.content}
        </div>
      )}
      <div className="mt-1 flex items-center justify-between gap-2">
        <span data-slot="tour-progress" className="text-xs text-muted-foreground tabular-nums">
          {index + 1} {text.of} {steps.length}
        </span>
        <div className="flex gap-1.5">
          {index > 0 && (
            <Button size="sm" variant="outline" onClick={() => go(index - 1)}>
              {text.back}
            </Button>
          )}
          <Button ref={nextRef} size="sm" onClick={() => go(index + 1)}>
            {last ? text.done : text.next}
          </Button>
        </div>
      </div>
    </>
  );

  const cardClassName = cn("z-50 w-80 max-w-[calc(100vw-2rem)] gap-2", className);

  return (
    <>
      <Portal.Root>
        <svg
          data-slot="tour-overlay"
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 size-full"
          width={W}
          height={H}
        >
          {/* Only the painted path takes clicks; the svg box itself lets them through. */}
          <path
            d={d}
            fillRule="evenodd"
            onClick={closeOnOverlayClick ? close : undefined}
            className="pointer-events-auto fill-black/50 transition-[d] duration-200"
          />
          {/* An outline around the hole, so it still reads on a dark page. */}
          {hole && (
            <rect
              data-slot="tour-highlight"
              x={hole.x}
              y={hole.y}
              width={hole.w}
              height={hole.h}
              rx={r}
              className="fill-none stroke-ring stroke-2 transition-all duration-200"
            />
          )}
        </svg>
      </Portal.Root>
      {element ? (
        <Popover open>
          <PopoverAnchor
            virtualRef={virtualRef as React.RefObject<{ getBoundingClientRect: () => DOMRect }>}
          />
          <PopoverContent
            data-slot="tour"
            role="dialog"
            aria-labelledby={titleId}
            side={step.side ?? "bottom"}
            align={step.align ?? "center"}
            sideOffset={12}
            collisionPadding={16}
            updatePositionStrategy="always"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className={cardClassName}
          >
            {card}
          </PopoverContent>
        </Popover>
      ) : (
        <Portal.Root>
          <div
            data-slot="tour"
            role="dialog"
            aria-labelledby={titleId}
            className={cn(
              "fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10",
              cardClassName,
            )}
          >
            {card}
          </div>
        </Portal.Root>
      )}
    </>
  );
}

export { Tour };
export type { TourProps, TourStep };
