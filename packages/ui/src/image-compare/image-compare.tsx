"use client";

import { ChevronsLeftRightIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import { useControllableState } from "../hooks/use-controllable-state";

interface ImageCompareProps extends Omit<React.ComponentProps<"div">, "children" | "defaultValue"> {
  /** What shows on the left (or top) of the divider: an image, a video, anything. */
  before: React.ReactNode;
  /** What shows on the right (or bottom). It sets the size of the whole component. */
  after: React.ReactNode;
  /** Where the divider sits, from 0 to 100. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** `vertical` puts before on top and after below, with a divider you drag up and down. */
  orientation?: "horizontal" | "vertical";
  /** Small tags in the corners, such as "Before" and "After". */
  beforeLabel?: React.ReactNode;
  afterLabel?: React.ReactNode;
  /** What screen readers call the divider. */
  label?: string;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

const labelClass =
  "pointer-events-none absolute top-3 left-3 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm";

/**
 * Two images on top of each other, with a divider you drag to show more of one
 * or the other. Drag anywhere on it, or focus the handle and use the arrow
 * keys. On touch screens, the page still scrolls the other way.
 */
function ImageCompare({
  before,
  after,
  value,
  defaultValue = 50,
  onValueChange,
  orientation = "horizontal",
  beforeLabel,
  afterLabel,
  label = "Divider between the two images",
  className,
  style,
  ...props
}: ImageCompareProps) {
  const [position, setPosition] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const vertical = orientation === "vertical";

  /** The pointer's place along the component, as a percentage. */
  const moveTo = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = vertical
      ? (event.clientY - box.top) / box.height
      : (event.clientX - box.left) / box.width;
    setPosition(Math.round(clamp(ratio * 100) * 10) / 10);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const next = {
      ArrowLeft: position - step,
      ArrowUp: position - step,
      ArrowRight: position + step,
      ArrowDown: position + step,
      PageUp: position - 10,
      PageDown: position + 10,
      Home: 0,
      End: 100,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setPosition(clamp(Math.round(next)));
  };

  return (
    <div
      data-slot="image-compare"
      data-orientation={orientation}
      className={cn(
        "group/image-compare relative isolate overflow-hidden rounded-xl select-none",
        // The page keeps scrolling the other way on touch screens.
        vertical ? "touch-pan-x" : "touch-pan-y",
        "[&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover",
        className,
      )}
      style={{ "--position": `${position}%`, ...style } as React.CSSProperties}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        moveTo(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event);
      }}
      {...props}
    >
      <div data-slot="image-compare-after" className="size-full">
        {after}
      </div>
      <div
        data-slot="image-compare-before"
        className={cn(
          "absolute inset-0",
          vertical
            ? "[clip-path:inset(0_0_calc(100%-var(--position))_0)]"
            : "[clip-path:inset(0_calc(100%-var(--position))_0_0)]",
        )}
      >
        {before}
      </div>
      {beforeLabel && (
        <span data-slot="image-compare-label" className={labelClass}>
          {beforeLabel}
        </span>
      )}
      {afterLabel && (
        <span
          data-slot="image-compare-label"
          className={cn(labelClass, vertical ? "top-auto bottom-3" : "right-3 left-auto")}
        >
          {afterLabel}
        </span>
      )}
      <div
        data-slot="image-compare-divider"
        className={cn(
          "pointer-events-none absolute bg-background shadow-sm",
          vertical
            ? "inset-x-0 top-(--position) h-0.5 -translate-y-1/2"
            : "inset-y-0 left-(--position) w-0.5 -translate-x-1/2",
        )}
      >
        <div
          data-slot="image-compare-handle"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-orientation={orientation}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}%`}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex size-8 -translate-1/2 cursor-grab items-center justify-center rounded-full bg-background text-foreground shadow-md ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing [&_svg]:size-4"
        >
          {vertical ? <ChevronsUpDownIcon /> : <ChevronsLeftRightIcon />}
        </div>
      </div>
    </div>
  );
}

export { ImageCompare, type ImageCompareProps };
