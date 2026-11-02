"use client";

import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
import {
  Button,
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanHandle,
  KanbanItem,
} from "@cladux/ui";

const initial: Record<string, string[]> = {
  Backlog: ["Dark mode for emails", "CSV export", "SSO with Okta"],
  Next: ["Usage-based billing"],
  Shipped: [],
};

export default function KanbanHandleDemo() {
  const [columns, setColumns] = React.useState(initial);

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemId={(item) => item}
      className="w-full max-w-3xl"
    >
      {Object.entries(columns).map(([column, items]) => (
        <KanbanColumn key={column} id={column} className="w-auto min-w-44 flex-1">
          <KanbanColumnHeader>
            <KanbanColumnTitle>{column}</KanbanColumnTitle>
          </KanbanColumnHeader>
          <KanbanColumnContent>
            {items.map((item) => (
              <KanbanItem key={item} id={item} className="flex items-center gap-1.5 p-1.5">
                <KanbanHandle />
                <span className="flex-1">{item}</span>
                <Button variant="ghost" size="icon-xs" aria-label={`Options for ${item}`}>
                  <MoreHorizontalIcon />
                </Button>
              </KanbanItem>
            ))}
            {items.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">Drop items here</p>
            )}
          </KanbanColumnContent>
        </KanbanColumn>
      ))}
    </Kanban>
  );
}
