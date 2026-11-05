"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@cladux/utils";

interface DockProps extends React.ComponentProps<"div"> {
  /** How big the item under the pointer grows: 1.5 is half again its size. */
  magnification?: number;
  /** How far, in pixels, the growing reaches from the pointer to its neighbors. */
  distance?: number;
  /** The items' size, in pixels, when nothing is near them. */
  size?: number;
}

/**
 * A macOS-style bar of icons that grow as the pointer passes over them, pushing
 * their neighbors aside. It's a toolbar: Tab reaches it, the arrow keys move
 * between items, and the focused item grows too. On touch screens nothing
 * grows, and the items are plain buttons.
 */
function Dock({
  magnification = 1.6,
  distance = 120,
  size = 40,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: DockProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const items = () => [
    ...(ref.current?.querySelectorAll<HTMLElement>("[data-slot=dock-item]") ?? []),
  ];

  /** Sizes every item by its distance from `x`; null puts them all back. */
  const magnify = (x: number | null) => {
    for (const item of items()) {
      let scale = 1;
      if (x !== null) {
        const box = item.getBoundingClientRect();
        const away = Math.min(Math.abs(x - (box.left + box.width / 2)) / distance, 1);
        // A cosine curve: full size right under the pointer, easing to none at `distance`.
        scale = 1 + (magnification - 1) * Math.cos((away * Math.PI) / 2);
      }
      item.style.setProperty("--dock-scale", scale.toFixed(3));
    }
  };

  /** The arrow keys, Home and End move between items, like any toolbar. */
  const move = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const list = items().filter((item) => !item.matches(":disabled"));
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    const next = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: list.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    list[(next + list.length) % list.length]?.focus();
  };

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-orientation="horizontal"
      data-slot="dock"
      className={cn(
        // A fixed height: growing items rise out of the top instead of moving the page.
        "mx-auto box-content flex h-(--dock-size) w-max items-end gap-2 rounded-2xl border bg-background/80 p-2 shadow-lg backdrop-blur-md",
        className,
      )}
      style={{ "--dock-size": `${size}px`, ...style } as React.CSSProperties}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (event.pointerType !== "touch") magnify(event.clientX);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        magnify(null);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        // Keyboard focus grows the item like the pointer would; a click already did.
        const item = (event.target as HTMLElement).closest<HTMLElement>("[data-slot=dock-item]");
        if (item?.matches(":focus-visible")) {
          const box = item.getBoundingClientRect();
          magnify(box.left + box.width / 2);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!ref.current?.contains(event.relatedTarget)) magnify(null);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        move(event);
      }}
      {...props}
    />
  );
}

interface DockItemProps extends React.ComponentProps<"button"> {
  /** The name shown above the item, and read by screen readers. */
  label: string;
  /** Shows a dot under the item, like a running app. */
  active?: boolean;
  /** Render your own element instead, such as a link. */
  asChild?: boolean;
}

function DockItem({ label, active, asChild, className, children, ...props }: DockItemProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="dock-item"
      data-active={active || undefined}
      aria-label={label}
      className={cn(
        "group/dock-item relative flex size-[calc(var(--dock-size)*var(--dock-scale,1))] shrink-0 items-center justify-center rounded-[28%] bg-muted text-foreground transition-[width,height,background-color] duration-150 ease-out outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-1/2 [&_svg]:shrink-0",
        className,
      )}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover/dock-item:opacity-100 group-focus-visible/dock-item:opacity-100"
      >
        {label}
      </span>
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground/60"
        />
      )}
    </Comp>
  );
}

/** A thin line between groups of items. */
function DockSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      data-slot="dock-separator"
      className={cn("mx-1 h-(--dock-size) w-px bg-border", className)}
      {...props}
    />
  );
}

export { Dock, DockItem, DockSeparator, type DockProps, type DockItemProps };
