"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

import {
  type DragEndEvent,
  SortableEngine,
  SortableHandle,
  SortableItem,
  useSortableEngine,
} from "../sortable/sortable";

const defaultGetId = (item: unknown) =>
  typeof item === "object" && item !== null && "id" in item
    ? String((item as { id: unknown }).id)
    : String(item);

interface KanbanProps<T> extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "onDragStart" | "onDragEnd"
> {
  /** Items per column, keyed by column id. The key order is the column order. */
  value: Record<string, T[]>;
  onValueChange: (value: Record<string, T[]>) => void;
  /** Defaults to `item.id`. */
  getItemId?: (item: T) => string;
  onDragStart?: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  getItemLabel?: (id: string) => string;
  disabled?: boolean;
}

function Kanban<T>({
  value,
  onValueChange,
  getItemId = defaultGetId,
  onDragStart,
  onDragEnd,
  getItemLabel,
  disabled,
  className,
  ...props
}: KanbanProps<T>) {
  const byId = new Map<string, T>();
  const ids: Record<string, string[]> = {};
  for (const [column, items] of Object.entries(value)) {
    ids[column] = items.map((item) => {
      const id = getItemId(item);
      byId.set(id, item);
      return id;
    });
  }

  return (
    <SortableEngine
      ids={ids}
      onMove={(next) => {
        const out: Record<string, T[]> = {};
        for (const [column, list] of Object.entries(next))
          out[column] = list.map((id) => byId.get(id)!);
        onValueChange(out);
      }}
      orientation="vertical"
      containerOrientation="horizontal"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      getItemLabel={getItemLabel}
      disabled={disabled}
    >
      <div
        data-slot="kanban"
        className={cn("flex w-full gap-3 overflow-x-auto pb-2", className)}
        {...props}
      />
    </SortableEngine>
  );
}

const ColumnContext = React.createContext<string | null>(null);

function KanbanColumn({
  id,
  className,
  ...props
}: React.ComponentProps<"section"> & { id: string }) {
  const engine = useSortableEngine();
  const register = React.useCallback(
    (el: HTMLElement | null) => engine.registerArea(id, el),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );
  return (
    <ColumnContext.Provider value={id}>
      <section
        ref={register}
        data-slot="kanban-column"
        data-id={id}
        className={cn(
          "flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/50 p-2 text-sm ring-1 ring-foreground/5",
          className,
        )}
        {...props}
      />
    </ColumnContext.Provider>
  );
}

function KanbanColumnHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="kanban-column-header"
      className={cn("flex items-center justify-between gap-2 px-1.5 pt-0.5", className)}
      {...props}
    />
  );
}

function KanbanColumnTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="kanban-column-title"
      className={cn("flex items-center gap-2 text-sm font-medium", className)}
      {...props}
    />
  );
}

/** The list the cards sit in. It grows to fill the column, so the whole column is a drop target. */
function KanbanColumnContent({ className, ...props }: React.ComponentProps<"div">) {
  const engine = useSortableEngine();
  const id = React.useContext(ColumnContext);
  if (!id) throw new Error("KanbanColumnContent must be inside KanbanColumn.");
  const register = React.useCallback(
    (el: HTMLElement | null) => engine.registerList(id, el),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );
  return (
    <div
      ref={register}
      data-slot="kanban-column-content"
      className={cn("relative flex min-h-16 flex-1 flex-col gap-2", className)}
      {...props}
    />
  );
}

function KanbanItem({ className, ...props }: React.ComponentProps<typeof SortableItem>) {
  return (
    <SortableItem
      data-slot="kanban-item"
      className={cn(
        "rounded-lg bg-card p-2.5 text-card-foreground shadow-xs ring-1 ring-foreground/10",
        className,
      )}
      {...props}
    />
  );
}

const KanbanHandle = SortableHandle;

export {
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanHandle,
  KanbanItem,
};
export type { KanbanProps };
