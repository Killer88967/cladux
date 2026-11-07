"use client";

import { PlusIcon } from "lucide-react";
import * as React from "react";
import { Button, Masonry } from "@cladux/ui";

const heights = [96, 160, 120, 200, 140, 88, 176, 112];

export default function MasonryColumns() {
  const [count, setCount] = React.useState(6);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Masonry columns={3} gap={10}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-lg border bg-muted/50 text-sm font-medium text-muted-foreground"
            style={{ height: heights[i % heights.length] }}
          >
            {i + 1}
          </div>
        ))}
      </Masonry>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setCount((c) => c + 1)}>
          <PlusIcon />
          Add item
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={count === 0}
          onClick={() => setCount((c) => Math.max(0, c - 1))}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
