"use client";

import * as React from "react";
import { Button, VirtualList, type VirtualListHandle } from "@cladux/ui";

const words =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(
    " ",
  );

const messages = Array.from({ length: 2_000 }, (_, i) => ({
  id: i,
  author: i % 3 === 0 ? "Ada" : i % 3 === 1 ? "Grace" : "Linus",
  // Between 4 and 60 words, so rows have very different heights.
  text: Array.from({ length: 4 + ((i * 37) % 57) }, (_, j) => words[(i + j) % words.length]).join(
    " ",
  ),
}));

export default function VirtualListDynamic() {
  const list = React.useRef<VirtualListHandle>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => list.current?.scrollToIndex(0)}>
          Top
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => list.current?.scrollToIndex(1000, { align: "center" })}
        >
          Message 1,001
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => list.current?.scrollToIndex(messages.length - 1)}
        >
          Bottom
        </Button>
      </div>
      <VirtualList
        ref={list}
        items={messages}
        estimateSize={64}
        gap={8}
        getItemKey={(m) => m.id}
        className="h-80 rounded-lg border p-2"
        renderItem={(m, i) => (
          <div className="rounded-lg bg-muted/50 p-2.5 text-sm">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{m.author}</span>
              <span className="text-muted-foreground">#{i + 1}</span>
            </div>
            <p className="text-muted-foreground">{m.text}</p>
          </div>
        )}
      />
    </div>
  );
}
