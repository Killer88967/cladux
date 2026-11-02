"use client";

import * as React from "react";
import { Sortable, SortableItem } from "@cladux/ui";

export default function SortableHorizontal() {
  const [tabs, setTabs] = React.useState(["Overview", "Analytics", "Reports", "Settings"]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Sortable value={tabs} onValueChange={setTabs} orientation="horizontal" className="gap-1.5">
        {tabs.map((tab) => (
          <SortableItem
            key={tab}
            id={tab}
            className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium"
          >
            {tab}
          </SortableItem>
        ))}
      </Sortable>
      <p className="text-xs text-muted-foreground">Drag the tabs, or focus one and press Space.</p>
    </div>
  );
}
