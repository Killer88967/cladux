"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

interface MasonryProps extends React.ComponentProps<"div"> {
  /** A fixed number of columns. Without it, as many columns as fit `columnWidth`. */
  columns?: number;
  /** The narrowest a column can be, in pixels, when `columns` isn't set. */
  columnWidth?: number;
  /** The space between items, in pixels, across and down. */
  gap?: number;
}

interface Placement {
  x: number;
  y: number;
}

/**
 * A grid of items with different heights, packed into columns like Pinterest.
 * Each item goes into the shortest column, so the columns end up even, but
 * the order stays left to right for reading and for Tab. Before JavaScript
 * runs, CSS columns lay it out, so it looks right from the first paint.
 */
function Masonry({
  columns,
  columnWidth = 240,
  gap = 16,
  className,
  style,
  children,
  ...props
}: MasonryProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const items = React.useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = React.useState<{
    width: number;
    height: number;
    placements: Placement[];
  } | null>(null);
  const [animate, setAnimate] = React.useState(false);
  const list = React.Children.toArray(children);

  const count = (width: number) =>
    columns ?? Math.max(1, Math.floor((width + gap) / (columnWidth + gap)));

  const measure = React.useCallback(() => {
    const el = container.current;
    if (!el) return;
    const width = el.clientWidth;
    const n = count(width);
    const itemWidth = (width - gap * (n - 1)) / n;
    const heights = new Array<number>(n).fill(0);
    // Right to left, the first column is on the right.
    const rtl = getComputedStyle(el).direction === "rtl";
    const placements = items.current.slice(0, list.length).map((item) => {
      // The shortest column; the leftmost one when two are level.
      const column = heights.indexOf(Math.min(...heights));
      const x = (rtl ? n - 1 - column : column) * (itemWidth + gap);
      const placement = { x, y: heights[column]! };
      heights[column]! += (item?.offsetHeight ?? 0) + gap;
      return placement;
    });
    setLayout({ width: itemWidth, height: Math.max(0, Math.max(...heights) - gap), placements });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, columns, columnWidth, gap]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  // Lay out again when the box or any item changes size, such as when an image loads.
  React.useEffect(() => {
    const observer = new ResizeObserver(() => measure());
    if (container.current) observer.observe(container.current);
    for (const item of items.current) if (item) observer.observe(item);
    return () => observer.disconnect();
  }, [measure, list.length]);

  // Move smoothly when things change, but not into the first layout.
  React.useEffect(() => {
    if (!layout || animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [layout, animate]);

  const placed = layout && layout.placements.length === list.length;

  return (
    <div
      ref={container}
      data-slot="masonry"
      data-placed={placed || undefined}
      className={cn("relative w-full", className)}
      style={{
        // Before it's measured: CSS columns, which look the same but order top to bottom.
        ...(placed
          ? { height: layout.height }
          : columns
            ? { columnCount: columns, columnGap: gap }
            : { columnWidth, columnGap: gap }),
        ...style,
      }}
      {...props}
    >
      {list.map((child, i) => {
        const placement = placed ? layout.placements[i] : undefined;
        return (
          <div
            key={React.isValidElement(child) && child.key != null ? child.key : i}
            ref={(el) => {
              items.current[i] = el;
            }}
            data-slot="masonry-item"
            className={cn(
              "break-inside-avoid",
              placement && "absolute top-0 left-0",
              placement &&
                animate &&
                "transition-transform duration-300 ease-out motion-reduce:transition-none",
            )}
            style={
              placement
                ? {
                    width: layout!.width,
                    transform: `translate(${placement.x}px, ${placement.y}px)`,
                  }
                : { marginBottom: gap }
            }
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export { Masonry, type MasonryProps };
