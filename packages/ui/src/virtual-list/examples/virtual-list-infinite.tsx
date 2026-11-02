"use client";

import * as React from "react";
import { Spinner, VirtualList } from "@cladux/ui";

const PAGE = 30;
const LIMIT = 300;

export default function VirtualListInfinite() {
  const [items, setItems] = React.useState(() => Array.from({ length: PAGE }, (_, i) => i));
  const [loading, setLoading] = React.useState(false);
  const done = items.length >= LIMIT;

  const loadMore = React.useCallback(() => {
    if (loading || done) return;
    setLoading(true);
    // Stand-in for a fetch.
    setTimeout(() => {
      setItems((prev) => [...prev, ...Array.from({ length: PAGE }, (_, i) => prev.length + i)]);
      setLoading(false);
    }, 600);
  }, [loading, done]);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border">
      <VirtualList
        items={items}
        estimateSize={44}
        onEndReached={loadMore}
        className="h-72"
        renderItem={(n) => (
          <div className="flex h-11 items-center gap-3 border-b px-3 text-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs tabular-nums">
              {n + 1}
            </span>
            Notification {n + 1}
          </div>
        )}
      />
      <div className="flex h-8 items-center justify-center gap-2 border-t text-xs text-muted-foreground">
        {loading ? (
          <>
            <Spinner className="size-3" /> Loading…
          </>
        ) : done ? (
          "You're all caught up"
        ) : (
          `${items.length} loaded`
        )}
      </div>
    </div>
  );
}
