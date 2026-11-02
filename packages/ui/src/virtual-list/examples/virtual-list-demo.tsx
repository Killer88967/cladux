"use client";

import * as React from "react";
import { VirtualList } from "@cladux/ui";

const rows = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  name: `Customer ${String(i + 1).padStart(5, "0")}`,
  amount: ((i * 7919) % 100_000) / 100,
}));

export default function VirtualListDemo() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border">
      <VirtualList
        items={rows}
        estimateSize={40}
        getItemKey={(row) => row.id}
        className="h-72"
        renderItem={(row) => (
          <div className="flex h-10 items-center justify-between border-b px-3 text-sm">
            <span>{row.name}</span>
            <span className="text-muted-foreground tabular-nums">${row.amount.toFixed(2)}</span>
          </div>
        )}
      />
      <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">10,000 rows</p>
    </div>
  );
}
