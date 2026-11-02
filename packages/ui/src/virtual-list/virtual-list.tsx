"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

interface VirtualListHandle {
  /** Scroll so the item at `index` is visible. */
  scrollToIndex: (
    index: number,
    options?: { align?: "start" | "center" | "end" | "auto"; behavior?: ScrollBehavior },
  ) => void;
  /** The scrolling element. */
  element: HTMLDivElement | null;
}

interface VirtualListProps<T> extends Omit<React.ComponentProps<"div">, "children" | "ref"> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** A first guess at each row's height in px. Rows are measured once rendered. */
  estimateSize?: number | ((index: number) => number);
  /** Rows rendered beyond the visible ones, on each side. */
  overscan?: number;
  getItemKey?: (item: T, index: number) => React.Key;
  /** Called when the last rows come into view, for loading more. */
  onEndReached?: () => void;
  /** How many rows from the end `onEndReached` fires. */
  endReachedThreshold?: number;
  /** Space between rows in px. */
  gap?: number;
  ref?: React.Ref<VirtualListHandle>;
}

/** Index of the last offset that is <= `value` (offsets are sorted). */
function search(offsets: number[], value: number) {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid]! <= value) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Renders only the rows in view, so a list of 100,000 items scrolls like a list
 * of 20. Rows can be any height: each is measured when it renders, and the
 * scroll position holds steady when rows above the view change size.
 */
function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 36,
  overscan = 6,
  getItemKey = (_, index) => index,
  onEndReached,
  endReachedThreshold = 5,
  gap = 0,
  className,
  onScroll,
  ref,
  ...props
}: VirtualListProps<T>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewport, setViewport] = React.useState(0);
  // Measured heights, keyed by item key so they survive inserts and reorders.
  const sizes = React.useRef(new Map<React.Key, number>());
  const [version, setVersion] = React.useState(0);

  const estimate = React.useCallback(
    (index: number) => (typeof estimateSize === "function" ? estimateSize(index) : estimateSize),
    [estimateSize],
  );

  const keys = React.useMemo(
    () => items.map((item, i) => getItemKey(item, i)),
    [items, getItemKey],
  );

  // Where each row starts, and the total height.
  const { offsets, total } = React.useMemo(() => {
    const out = new Array<number>(keys.length);
    let y = 0;
    for (let i = 0; i < keys.length; i++) {
      out[i] = y;
      y += (sizes.current.get(keys[i]!) ?? estimate(i)) + (i < keys.length - 1 ? gap : 0);
    }
    return { offsets: out, total: y };
    // `version` bumps when a row is measured.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, estimate, gap, version]);

  const first = keys.length ? search(offsets, scrollTop) : 0;
  const lastVisible = keys.length ? search(offsets, scrollTop + viewport) : -1;
  const start = Math.max(0, first - overscan);
  const end = Math.min(keys.length - 1, lastVisible + overscan);

  // Track the viewport size.
  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewport(el.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure rendered rows. Batched per frame so a burst of resizes re-renders once.
  const pending = React.useRef(new Map<React.Key, { size: number; index: number }>());
  const frame = React.useRef(0);
  const firstRef = React.useRef(first);
  firstRef.current = first;
  const flush = React.useCallback(() => {
    frame.current = 0;
    const el = scrollRef.current;
    let shift = 0;
    let changed = false;
    for (const [key, { size, index }] of pending.current) {
      const before = sizes.current.get(key) ?? estimate(index);
      if (before === size) continue;
      sizes.current.set(key, size);
      changed = true;
      // Rows above the view changing size would push the content: compensate.
      if (index < firstRef.current) shift += size - before;
    }
    pending.current.clear();
    if (!changed) return;
    if (el && shift) el.scrollTop += shift;
    setVersion((v) => v + 1);
  }, [estimate]);

  const observer = React.useMemo(
    () =>
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver((entries) => {
            for (const entry of entries) {
              const el = entry.target as HTMLElement;
              const key = el.dataset.key!;
              const index = Number(el.dataset.index);
              const size = entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
              pending.current.set(keyMap.current.get(key) ?? key, { size, index });
            }
            if (!frame.current) frame.current = requestAnimationFrame(flush);
          }),
    [flush],
  );
  React.useEffect(() => () => observer?.disconnect(), [observer]);
  // data-key is a string; map it back to the real key.
  const keyMap = React.useRef(new Map<string, React.Key>());

  React.useImperativeHandle(
    ref,
    () => ({
      element: scrollRef.current,
      scrollToIndex: (index, { align = "auto", behavior = "auto" } = {}) => {
        const el = scrollRef.current;
        if (!el || !keys.length) return;
        const i = Math.max(0, Math.min(index, keys.length - 1));
        const top = offsets[i]!;
        const size = sizes.current.get(keys[i]!) ?? estimate(i);
        const view = el.clientHeight;
        let target = top;
        if (align === "center") target = top - (view - size) / 2;
        else if (align === "end") target = top - view + size;
        else if (align === "auto") {
          if (top >= el.scrollTop && top + size <= el.scrollTop + view) return;
          target = top < el.scrollTop ? top : top - view + size;
        }
        el.scrollTo({ top: Math.max(0, target), behavior });
      },
    }),
    [keys, offsets, estimate],
  );

  // Load more when the end comes into view.
  const endFired = React.useRef(-1);
  React.useEffect(() => {
    if (!onEndReached || !keys.length) return;
    if (end >= keys.length - 1 - endReachedThreshold && endFired.current !== keys.length) {
      endFired.current = keys.length;
      onEndReached();
    }
  }, [end, keys.length, onEndReached, endReachedThreshold]);

  const rows: React.ReactNode[] = [];
  for (let i = start; i <= end; i++) {
    const key = keys[i]!;
    keyMap.current.set(String(key), key);
    rows.push(
      <div
        key={key}
        data-slot="virtual-list-item"
        data-index={i}
        data-key={String(key)}
        role="listitem"
        aria-setsize={keys.length}
        aria-posinset={i + 1}
        ref={(el) => {
          if (!el || !observer) return;
          observer.observe(el);
          return () => observer.unobserve(el);
        }}
        className="absolute inset-x-0 top-0"
        style={{ transform: `translateY(${offsets[i]}px)` }}
      >
        {renderItem(items[i]!, i)}
      </div>,
    );
  }

  return (
    <div
      ref={scrollRef}
      data-slot="virtual-list"
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop);
        onScroll?.(e);
      }}
      className={cn("relative h-80 overflow-auto overscroll-contain", className)}
      {...props}
    >
      <div role="list" className="relative w-full" style={{ height: total }}>
        {rows}
      </div>
    </div>
  );
}

export { VirtualList };
export type { VirtualListHandle, VirtualListProps };
