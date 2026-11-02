"use client";

import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

interface TreeNode {
  id: string;
  /** Used for the label and for type-to-find. */
  name: string;
  /** Replaces the default folder or file icon. */
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

interface FlatNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
  posinset: number;
  setsize: number;
}

/** The nodes that are visible, in order: open folders show their children. */
function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  level = 1,
  parentId: string | null = null,
) {
  const out: FlatNode[] = [];
  nodes.forEach((node, index) => {
    out.push({ node, level, parentId, posinset: index + 1, setsize: nodes.length });
    if (node.children?.length && expanded.has(node.id)) {
      out.push(...flatten(node.children, expanded, level + 1, node.id));
    }
  });
  return out;
}

interface TreeViewProps extends Omit<
  React.ComponentProps<"ul">,
  "children" | "onSelect" | "defaultValue"
> {
  data: TreeNode[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedChange?: (id: string | null, node: TreeNode | null) => void;
  /** Ids of the open folders. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Change what a row shows after the chevron. */
  renderItem?: (node: TreeNode, state: { expanded: boolean; selected: boolean }) => React.ReactNode;
  /** Pixels per level. */
  indent?: number;
}

function TreeView({
  className,
  data,
  selectedId,
  defaultSelectedId = null,
  onSelectedChange,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  renderItem,
  indent = 16,
  style,
  ...props
}: TreeViewProps) {
  const [selected, setSelected] = useControllableState<string | null>({
    value: selectedId,
    defaultValue: defaultSelectedId,
    onChange: (id) =>
      onSelectedChange?.(id, id ? (rows.find((r) => r.node.id === id)?.node ?? null) : null),
  });
  const [expandedList, setExpandedList] = useControllableState({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  });
  const expanded = React.useMemo(() => new Set(expandedList), [expandedList]);
  const rows = React.useMemo(() => flatten(data, expanded), [data, expanded]);

  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const refs = React.useRef(new Map<string, HTMLLIElement>());
  // One row is in the tab order: the focused one, else the selected one, else the first.
  const tabbable =
    rows.find((r) => r.node.id === focusedId)?.node.id ??
    rows.find((r) => r.node.id === selected)?.node.id ??
    rows.find((r) => !r.node.disabled)?.node.id;

  const toggle = (id: string, open = !expanded.has(id)) => {
    if (open === expanded.has(id)) return;
    setExpandedList(open ? [...expandedList, id] : expandedList.filter((x) => x !== id));
  };
  const focus = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    refs.current.get(id)?.focus();
  };

  const typeahead = React.useRef({
    text: "",
    timer: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const at = rows.findIndex((r) => r.node.id === (e.target as HTMLElement).dataset.id);
    if (at === -1) return;
    const row = rows[at]!;
    const enabled = rows.filter((r) => !r.node.disabled);
    const nextEnabled = (from: number, step: 1 | -1) => {
      for (let i = from + step; i >= 0 && i < rows.length; i += step) {
        if (!rows[i]!.node.disabled) return rows[i]!.node.id;
      }
    };
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const key = rtl
      ? ({ ArrowLeft: "ArrowRight", ArrowRight: "ArrowLeft" }[e.key] ?? e.key)
      : e.key;
    const hasChildren = !!row.node.children?.length;
    const isOpen = expanded.has(row.node.id);

    const actions: Record<string, () => void> = {
      ArrowDown: () => focus(nextEnabled(at, 1)),
      ArrowUp: () => focus(nextEnabled(at, -1)),
      Home: () => focus(enabled[0]?.node.id),
      End: () => focus(enabled.at(-1)?.node.id),
      ArrowRight: () => {
        if (!hasChildren) return;
        if (!isOpen) toggle(row.node.id, true);
        else focus(row.node.children!.find((c) => !c.disabled)?.id);
      },
      ArrowLeft: () => {
        if (hasChildren && isOpen) toggle(row.node.id, false);
        else if (row.parentId) focus(row.parentId);
      },
      Enter: () => !row.node.disabled && setSelected(row.node.id),
      " ": () => !row.node.disabled && setSelected(row.node.id),
      "*": () => {
        // Open every folder at this level.
        const siblings = rows.filter((r) => r.parentId === row.parentId && r.node.children?.length);
        setExpandedList([...new Set([...expandedList, ...siblings.map((r) => r.node.id)])]);
      },
    };

    if (actions[key]) {
      e.preventDefault();
      actions[key]();
      return;
    }
    // Type to jump to the next row whose name starts with what was typed.
    if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typeahead.current;
      clearTimeout(t.timer);
      t.text += key.toLowerCase();
      t.timer = setTimeout(() => (t.text = ""), 500);
      const ordered = [...rows.slice(at + (t.text.length === 1 ? 1 : 0)), ...rows.slice(0, at)];
      const match = ordered.find(
        (r) => !r.node.disabled && r.node.name.toLowerCase().startsWith(t.text),
      );
      if (match) focus(match.node.id);
    }
  };

  return (
    <ul
      data-slot="tree-view"
      role="tree"
      onKeyDown={onKeyDown}
      className={cn("flex w-full min-w-0 flex-col gap-px text-sm outline-none", className)}
      style={{ "--tree-view-indent": `${indent}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {rows.map(({ node, level, posinset, setsize }) => {
        const hasChildren = !!node.children?.length;
        const isOpen = hasChildren && expanded.has(node.id);
        const isSelected = selected === node.id;
        return (
          <li
            key={node.id}
            ref={(el) => {
              if (el) refs.current.set(node.id, el);
              else refs.current.delete(node.id);
            }}
            data-id={node.id}
            data-slot="tree-view-item"
            role="treeitem"
            aria-level={level}
            aria-posinset={posinset}
            aria-setsize={setsize}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-selected={isSelected}
            aria-disabled={node.disabled || undefined}
            tabIndex={node.id === tabbable ? 0 : -1}
            onFocus={() => setFocusedId(node.id)}
            onClick={() => {
              if (node.disabled) return;
              focus(node.id);
              setSelected(node.id);
              if (hasChildren) toggle(node.id);
            }}
            className="flex h-8 min-w-0 cursor-pointer items-center gap-1.5 rounded-md ps-[calc(var(--tree-view-indent)*var(--level)+--spacing(1))] pe-2 transition-colors outline-none select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-selected:bg-muted aria-selected:font-medium aria-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            style={{ "--level": level - 1 } as React.CSSProperties}
          >
            <span
              data-slot="tree-view-chevron"
              aria-hidden
              onClick={(e) => {
                // The chevron only opens and closes.
                e.stopPropagation();
                if (!node.disabled && hasChildren) toggle(node.id);
                focus(node.id);
              }}
              className="flex size-4 items-center justify-center text-muted-foreground"
            >
              {hasChildren && (
                <ChevronRightIcon className="size-3.5! transition-transform in-aria-expanded:rotate-90 rtl:rotate-180 rtl:in-aria-expanded:rotate-90" />
              )}
            </span>
            {renderItem ? (
              renderItem(node, { expanded: isOpen, selected: isSelected })
            ) : (
              <>
                <span className="flex text-muted-foreground">
                  {node.icon ??
                    (hasChildren ? isOpen ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />)}
                </span>
                <span className="truncate">{node.name}</span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { TreeView };
export type { TreeNode, TreeViewProps };
