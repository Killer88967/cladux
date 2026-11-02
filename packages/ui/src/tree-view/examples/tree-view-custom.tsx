"use client";

import { DatabaseIcon, KeyRoundIcon, TableIcon } from "lucide-react";
import { Badge, TreeView, type TreeNode } from "@cladux/ui";

const counts: Record<string, number> = { users: 1284, orders: 9310, products: 412 };

const schema: TreeNode[] = [
  {
    id: "db",
    name: "production",
    icon: <DatabaseIcon />,
    children: [
      {
        id: "users",
        name: "users",
        icon: <TableIcon />,
        children: [{ id: "users.id", name: "id", icon: <KeyRoundIcon /> }],
      },
      { id: "orders", name: "orders", icon: <TableIcon /> },
      { id: "products", name: "products", icon: <TableIcon /> },
    ],
  },
];

export default function TreeViewCustom() {
  return (
    <TreeView
      aria-label="Database"
      data={schema}
      defaultExpanded={["db"]}
      indent={20}
      className="max-w-72"
      renderItem={(node) => (
        <>
          <span className="flex text-muted-foreground">{node.icon}</span>
          <span className="flex-1 truncate font-mono text-xs">{node.name}</span>
          {counts[node.id] !== undefined && (
            <Badge variant="secondary" className="tabular-nums">
              {counts[node.id]!.toLocaleString("en-US")}
            </Badge>
          )}
        </>
      )}
    />
  );
}
