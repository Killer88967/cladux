"use client";

import { GripVerticalIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

/* ----------------------------------------------------------------------------
 * The engine: drag items between any number of containers by pointer or
 * keyboard. Sortable is one container; Kanban is several. It works on ids and
 * calls `onMove` with the new order on every step, so your state always renders
 * the live order and React keeps the DOM in sync.
 * --------------------------------------------------------------------------*/

type Ids = Record<string, string[]>;
type Orientation = "vertical" | "horizontal";

interface DragEndEvent {
  id: string;
  from: { container: string; index: number };
  to: { container: string; index: number };
  /** Escape was pressed, so the order went back to how it was. */
  cancelled: boolean;
}

interface EngineProps {
  ids: Ids;
  onMove: (ids: Ids) => void;
  /** How items line up inside each container. */
  orientation: Orientation;
  /** How containers line up next to each other (for moving between them by keyboard). */
  containerOrientation?: Orientation;
  onDragStart?: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  /** The name read out for an item. Defaults to its text. */
  getItemLabel?: (id: string) => string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface EngineContextValue {
  activeId: string | null;
  mode: "pointer" | "keyboard" | null;
  disabled: boolean;
  registerItem: (id: string, el: HTMLElement | null) => void;
  /** The area that counts as "over this container" when dragging. */
  registerArea: (id: string, el: HTMLElement | null) => void;
  /** The element the items sit in. Defaults to the area. */
  registerList: (id: string, el: HTMLElement | null) => void;
  onPointerDown: (id: string, e: React.PointerEvent) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent) => void;
}

const EngineContext = React.createContext<EngineContextValue | null>(null);

function useEngine() {
  const context = React.useContext(EngineContext);
  if (!context) throw new Error("Sortable parts must be inside <Sortable> or <Kanban>.");
  return context;
}

const find = (ids: Ids, id: string) => {
  for (const [container, list] of Object.entries(ids)) {
    const index = list.indexOf(id);
    if (index !== -1) return { container, index };
  }
  return null;
};

const moveTo = (ids: Ids, id: string, container: string, index: number): Ids => {
  const next: Ids = {};
  for (const [key, list] of Object.entries(ids)) next[key] = list.filter((x) => x !== id);
  const target = next[container] ?? [];
  target.splice(Math.max(0, Math.min(index, target.length)), 0, id);
  next[container] = target;
  return next;
};

/** Offset of `el` inside `list`, ignoring transforms (so running animations don't count). */
function offsetIn(el: HTMLElement, list: HTMLElement) {
  let top = 0;
  let left = 0;
  let node: HTMLElement | null = el;
  while (node && node !== list) {
    top += node.offsetTop;
    left += node.offsetLeft;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent && parent !== list && !list.contains(parent)) {
      // The list isn't positioned: measure against its box instead.
      const a = el.getBoundingClientRect();
      const b = list.getBoundingClientRect();
      return { top: a.top - b.top + list.scrollTop, left: a.left - b.left + list.scrollLeft };
    }
    node = parent;
  }
  return { top, left };
}

const INTERACTIVE =
  "input, textarea, select, button, a, [contenteditable=''], [contenteditable='true']";

function SortableEngine({
  ids,
  onMove,
  orientation,
  containerOrientation = "horizontal",
  onDragStart,
  onDragEnd,
  getItemLabel,
  disabled = false,
  children,
}: EngineProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"pointer" | "keyboard" | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const items = React.useRef(new Map<string, HTMLElement>());
  const containers = React.useRef(new Map<string, { area?: HTMLElement; list?: HTMLElement }>());
  // Everything the event handlers need, kept current without re-binding them.
  const latest = React.useRef({ ids, onMove, onDragStart, onDragEnd, getItemLabel });
  latest.current = { ids, onMove, onDragStart, onDragEnd, getItemLabel };
  const drag = React.useRef<{
    id: string;
    how: "pointer" | "keyboard";
    snapshot: Ids;
    from: { container: string; index: number };
    pointer: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);
  const flip = React.useRef<Map<string, DOMRect> | null>(null);

  const label = (id: string) =>
    latest.current.getItemLabel?.(id) ?? items.current.get(id)?.textContent?.trim() ?? id;
  const position = (current: Ids, id: string) => {
    const at = find(current, id);
    if (!at) return "";
    const many = Object.keys(current).length > 1;
    return `position ${at.index + 1} of ${current[at.container]!.length}${many ? ` in ${at.container}` : ""}`;
  };

  /** Records where everything is, so the next render can animate from there. */
  const capture = () => {
    const rects = new Map<string, DOMRect>();
    for (const [id, el] of items.current) {
      if (id !== drag.current?.id) rects.set(id, el.getBoundingClientRect());
    }
    flip.current = rects;
  };

  const move = (container: string, index: number) => {
    const d = drag.current;
    if (!d) return;
    const current = latest.current.ids;
    const at = find(current, d.id);
    if (at && at.container === container && at.index === index) return;
    capture();
    const next = moveTo(current, d.id, container, index);
    latest.current.ids = next;
    latest.current.onMove(next);
    return next;
  };

  /** Keeps the dragged item under the pointer wherever the list has moved it. */
  const follow = () => {
    const d = drag.current;
    const el = d && items.current.get(d.id);
    if (!d || !el || d.how === "keyboard") return;
    el.style.transform = "";
    const rect = el.getBoundingClientRect();
    el.style.transform = `translate3d(${d.pointer.x - d.offset.x - rect.left}px, ${d.pointer.y - d.offset.y - rect.top}px, 0)`;
  };

  // After each move: animate the others from where they were, and keep focus.
  React.useLayoutEffect(() => {
    if (flip.current) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      for (const [id, before] of flip.current) {
        const el = items.current.get(id);
        if (!el || reduced) continue;
        const after = el.getBoundingClientRect();
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (dx || dy) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" },
          );
        }
      }
      flip.current = null;
    }
    if (drag.current && mode === "pointer") follow();
    if (drag.current && mode === "keyboard") {
      const el = items.current.get(drag.current.id);
      const target = el?.querySelector<HTMLElement>("[data-slot=sortable-handle]") ?? el;
      if (target && document.activeElement !== target) target.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });

  /** Which container the pointer is over, and where in it. */
  const targetAt = (x: number, y: number) => {
    const d = drag.current!;
    const current = latest.current.ids;
    let chosen: string | null = null;
    for (const [id, { area, list }] of containers.current) {
      const r = (area ?? list)?.getBoundingClientRect();
      if (!r) continue;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) chosen = id;
    }
    // Outside every container: stay where it is (a single list clamps to its ends).
    chosen ??= find(current, d.id)?.container ?? null;
    const entry = chosen ? containers.current.get(chosen) : undefined;
    const listEl = entry?.list ?? entry?.area;
    if (!chosen || !listEl) return null;
    const box = { list: listEl };
    const lr = box.list.getBoundingClientRect();
    const local =
      orientation === "vertical"
        ? y - lr.top + box.list.scrollTop - box.list.clientTop
        : x - lr.left + box.list.scrollLeft - box.list.clientLeft;
    // Count the other items whose middle is before the pointer.
    let index = 0;
    for (const id of current[chosen] ?? []) {
      if (id === d.id) continue;
      const el = items.current.get(id);
      if (!el) continue;
      const o = offsetIn(el, box.list);
      const mid =
        orientation === "vertical" ? o.top + el.offsetHeight / 2 : o.left + el.offsetWidth / 2;
      if (mid < local) index++;
    }
    return { container: chosen, index };
  };

  const finish = (cancelled: boolean) => {
    const d = drag.current;
    if (!d) return;
    if (cancelled) {
      capture();
      latest.current.ids = d.snapshot;
      latest.current.onMove(d.snapshot);
    }
    const el = items.current.get(d.id);
    if (el && el.style.transform) {
      // Settle into place.
      const from = el.style.transform;
      el.style.transform = "";
      el.animate([{ transform: from }, { transform: "translate3d(0, 0, 0)" }], {
        duration: 180,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
      });
    }
    const to = find(cancelled ? d.snapshot : latest.current.ids, d.id) ?? d.from;
    setAnnouncement(
      cancelled
        ? `Cancelled. ${label(d.id)} returned to ${position(d.snapshot, d.id)}.`
        : `Dropped ${label(d.id)} at ${position(latest.current.ids, d.id)}.`,
    );
    drag.current = null;
    setActiveId(null);
    setMode(null);
    document.body.style.removeProperty("user-select");
    document.body.style.removeProperty("cursor");
    latest.current.onDragEnd?.({ id: d.id, from: d.from, to, cancelled });
  };

  const begin = (id: string, how: "pointer" | "keyboard", pointer = { x: 0, y: 0 }) => {
    const current = latest.current.ids;
    const from = find(current, id);
    const el = items.current.get(id);
    if (!from || !el) return false;
    const rect = el.getBoundingClientRect();
    drag.current = {
      id,
      how,
      snapshot: current,
      from,
      pointer,
      offset: { x: pointer.x - rect.left, y: pointer.y - rect.top },
    };
    setActiveId(id);
    setMode(how);
    setAnnouncement(
      `Picked up ${label(id)}, ${position(current, id)}.${how === "keyboard" ? " Use the arrow keys to move, Space to drop, Escape to cancel." : ""}`,
    );
    latest.current.onDragStart?.(id);
    return true;
  };

  const onPointerDown = (id: string, e: React.PointerEvent) => {
    if (disabled || e.button !== 0 || drag.current) return;
    const item = items.current.get(id);
    const target = e.target as HTMLElement;
    const handle = target.closest("[data-slot=sortable-handle]");
    // With a handle, only the handle drags. Without one, anything but a control does.
    if (
      item?.querySelector("[data-slot=sortable-handle]")
        ? !handle
        : target.closest(INTERACTIVE) && !handle
    )
      return;

    const start = { x: e.clientX, y: e.clientY };
    let started = false;
    let scrollFrame = 0;

    const autoScroll = () => {
      const d = drag.current;
      if (!d) return;
      const edge = 48;
      const { x, y } = d.pointer;
      const dy = y < edge ? -(edge - y) : y > innerHeight - edge ? y - (innerHeight - edge) : 0;
      const dx = x < edge ? -(edge - x) : x > innerWidth - edge ? x - (innerWidth - edge) : 0;
      if (dx || dy) {
        window.scrollBy(dx / 3, dy / 3);
        follow();
        const t = targetAt(x, y);
        if (t) move(t.container, t.index);
      }
      scrollFrame = requestAnimationFrame(autoScroll);
    };

    const onMoveEvent = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 5) return;
        started = begin(id, "pointer", start);
        if (!started) return cleanup();
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
        scrollFrame = requestAnimationFrame(autoScroll);
      }
      const d = drag.current;
      if (!d) return;
      d.pointer = { x: ev.clientX, y: ev.clientY };
      follow();
      const t = targetAt(ev.clientX, ev.clientY);
      if (t) move(t.container, t.index);
    };
    const onUp = () => {
      cleanup();
      if (!started) return;
      // The click that follows a drag shouldn't trigger whatever is under it.
      const suppress = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener("click", suppress, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", suppress, true), 0);
      finish(false);
    };
    const onCancel = () => {
      cleanup();
      if (started) finish(true);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && started) {
        ev.preventDefault();
        onCancel();
      }
    };
    const cleanup = () => {
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("pointermove", onMoveEvent);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
    };
    window.addEventListener("pointermove", onMoveEvent);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
  };

  const onKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.target !== e.currentTarget) return;
    const d = drag.current;
    if (!d) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        begin(id, "keyboard");
      }
      return;
    }
    if (d.id !== id) return;
    const current = latest.current.ids;
    const at = find(current, id)!;
    const order = Object.keys(current);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const flipH = (key: string) =>
      rtl ? ({ ArrowLeft: "ArrowRight", ArrowRight: "ArrowLeft" }[key] ?? key) : key;
    const key = flipH(e.key);
    const prevItem = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextItem = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const prevBox = containerOrientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextBox = containerOrientation === "horizontal" ? "ArrowRight" : "ArrowDown";

    let next: Ids | undefined;
    if (key === prevItem) next = move(at.container, at.index - 1);
    else if (key === nextItem) next = move(at.container, at.index + 1);
    else if (order.length > 1 && (key === prevBox || key === nextBox)) {
      const to = order[order.indexOf(at.container) + (key === nextBox ? 1 : -1)];
      if (to) next = move(to, Math.min(at.index, current[to]!.length));
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      finish(false);
      return;
    } else if (e.key === "Escape") {
      e.preventDefault();
      finish(true);
      return;
    } else if (e.key === "Tab") {
      finish(false);
      return;
    } else return;

    e.preventDefault();
    if (next) setAnnouncement(`${label(id)} moved to ${position(next, id)}.`);
  };

  const context: EngineContextValue = {
    activeId,
    mode,
    disabled,
    registerItem: (id, el) => {
      if (el) items.current.set(id, el);
      else items.current.delete(id);
    },
    registerArea: (id, el) => {
      const entry = containers.current.get(id) ?? {};
      entry.area = el ?? undefined;
      if (entry.area || entry.list) containers.current.set(id, entry);
      else containers.current.delete(id);
    },
    registerList: (id, el) => {
      const entry = containers.current.get(id) ?? {};
      entry.list = el ?? undefined;
      if (entry.area || entry.list) containers.current.set(id, entry);
      else containers.current.delete(id);
    },
    onPointerDown,
    onKeyDown,
  };

  return (
    <EngineContext.Provider value={context}>
      {children}
      <span aria-live="assertive" aria-atomic className="sr-only">
        {announcement}
      </span>
    </EngineContext.Provider>
  );
}

/* ----------------------------------------------------------------------------
 * Items and handles, shared by Sortable and Kanban.
 * --------------------------------------------------------------------------*/

const ItemContext = React.createContext<{
  id: string;
  setHasHandle: (has: boolean) => void;
} | null>(null);

function SortableItem({
  id,
  className,
  ref,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & { id: string }) {
  const engine = useEngine();
  const [hasHandle, setHasHandle] = React.useState(false);
  const dragging = engine.activeId === id;

  const setRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      engine.registerItem(id, el);
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  return (
    <ItemContext.Provider value={{ id, setHasHandle }}>
      <div
        ref={setRef}
        data-slot="sortable-item"
        data-id={id}
        data-dragging={dragging ? engine.mode : undefined}
        tabIndex={hasHandle || engine.disabled ? undefined : 0}
        role={hasHandle ? undefined : "button"}
        aria-roledescription={hasHandle ? undefined : "sortable item"}
        aria-pressed={hasHandle ? undefined : dragging}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          engine.onPointerDown(id, e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!hasHandle) engine.onKeyDown(id, e);
        }}
        className={cn(
          "relative outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:z-50 data-[dragging=keyboard]:ring-3 data-[dragging=keyboard]:ring-ring/50 data-[dragging=pointer]:shadow-lg",
          !hasHandle && !engine.disabled && "cursor-grab touch-none select-none",
          className,
        )}
        {...props}
      />
    </ItemContext.Provider>
  );
}

/** The grip people drag. With a handle, the rest of the item can hold buttons and links. */
function SortableHandle({
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"button">) {
  const engine = useEngine();
  const item = React.useContext(ItemContext);
  if (!item) throw new Error("SortableHandle must be inside SortableItem.");
  const { id, setHasHandle } = item;

  React.useEffect(() => {
    setHasHandle(true);
    return () => setHasHandle(false);
  }, [setHasHandle]);

  return (
    <button
      type="button"
      data-slot="sortable-handle"
      aria-label="Drag to reorder"
      aria-roledescription="sortable handle"
      aria-pressed={engine.activeId === id}
      disabled={engine.disabled}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        engine.onKeyDown(id, e);
      }}
      className={cn(
        "flex shrink-0 cursor-grab touch-none items-center justify-center rounded-[min(var(--radius-md),10px)] text-muted-foreground transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-muted aria-pressed:text-foreground [&_svg:not([class*='size-'])]:size-4",
        !children && "size-6",
        className,
      )}
      {...props}
    >
      {children ?? <GripVerticalIcon />}
    </button>
  );
}

/* ----------------------------------------------------------------------------
 * Sortable: one list.
 * --------------------------------------------------------------------------*/

const defaultGetId = (item: unknown) =>
  typeof item === "object" && item !== null && "id" in item
    ? String((item as { id: unknown }).id)
    : String(item);

interface SortableProps<T> extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "onDragStart" | "onDragEnd"
> {
  value: T[];
  onValueChange: (value: T[]) => void;
  /** Defaults to `item.id`, or the item itself for strings and numbers. */
  getItemId?: (item: T) => string;
  orientation?: Orientation;
  onDragStart?: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  getItemLabel?: (id: string) => string;
  disabled?: boolean;
}

function Sortable<T>({
  value,
  onValueChange,
  getItemId = defaultGetId,
  orientation = "vertical",
  onDragStart,
  onDragEnd,
  getItemLabel,
  disabled,
  className,
  ...props
}: SortableProps<T>) {
  const byId = new Map(value.map((item) => [getItemId(item), item]));
  const ids = { list: value.map(getItemId) };

  return (
    <SortableEngine
      ids={ids}
      onMove={(next) => onValueChange(next.list!.map((id) => byId.get(id)!))}
      orientation={orientation}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      getItemLabel={getItemLabel}
      disabled={disabled}
    >
      <SortableList
        data-orientation={orientation}
        className={cn(
          "flex gap-2 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      />
    </SortableEngine>
  );
}

function SortableList({ className, ...props }: React.ComponentProps<"div">) {
  const engine = useEngine();
  return (
    <div
      ref={(el) => engine.registerArea("list", el)}
      data-slot="sortable"
      className={cn("relative", className)}
      {...props}
    />
  );
}

export { Sortable, SortableEngine, SortableHandle, SortableItem, useEngine as useSortableEngine };
export type { DragEndEvent, SortableProps };
