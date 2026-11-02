import { TreeView, type TreeNode } from "@cladux/ui";

const files: TreeNode[] = [
  {
    id: "app",
    name: "app",
    children: [
      { id: "app/layout.tsx", name: "layout.tsx" },
      { id: "app/page.tsx", name: "page.tsx" },
      {
        id: "app/docs",
        name: "docs",
        children: [{ id: "app/docs/page.tsx", name: "page.tsx" }],
      },
    ],
  },
  {
    id: "components",
    name: "components",
    children: [
      { id: "components/button.tsx", name: "button.tsx" },
      { id: "components/tree-view.tsx", name: "tree-view.tsx" },
    ],
  },
  { id: "package.json", name: "package.json" },
  { id: "README.md", name: "README.md" },
];

export default function TreeViewDemo() {
  return (
    <TreeView
      aria-label="Files"
      data={files}
      defaultExpanded={["app", "components"]}
      defaultSelectedId="app/page.tsx"
      className="max-w-64"
    />
  );
}
