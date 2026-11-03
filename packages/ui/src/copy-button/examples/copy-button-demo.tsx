import { CopyButton } from "@cladux/ui";

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-2 rounded-lg border py-1 ps-3 pe-1 font-mono text-sm">
      <span>pnpm dlx cladux-ui@latest init</span>
      <CopyButton value="pnpm dlx cladux-ui@latest init" />
    </div>
  );
}
