"use client";

import * as React from "react";
import { Button, TreeView, type TreeNode } from "@cladux/ui";

const data: TreeNode[] = [
  {
    id: "fruit",
    name: "Fruit",
    children: [
      { id: "apple", name: "Apple" },
      { id: "banana", name: "Banana" },
      {
        id: "citrus",
        name: "Citrus",
        children: [
          { id: "lemon", name: "Lemon" },
          { id: "orange", name: "Orange" },
        ],
      },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    children: [
      { id: "carrot", name: "Carrot" },
      { id: "kale", name: "Kale", disabled: true },
    ],
  },
];

const folders = ["fruit", "citrus", "vegetables"];

export default function TreeViewControlled() {
  const [expanded, setExpanded] = React.useState<string[]>(["fruit"]);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setExpanded(folders)}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </div>
      <TreeView
        aria-label="Groceries"
        data={data}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selectedId={selected}
        onSelectedChange={setSelected}
      />
      <p className="text-xs text-muted-foreground">Selected: {selected ?? "nothing"}</p>
    </div>
  );
}
