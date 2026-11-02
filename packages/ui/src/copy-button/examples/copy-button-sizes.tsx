import { CopyButton } from "@cladux/ui";

export default function CopyButtonSizes() {
  return (
    <div className="flex items-center gap-2">
      <CopyButton size="icon-xs" variant="outline" value="xs" />
      <CopyButton size="icon-sm" variant="outline" value="sm" />
      <CopyButton size="icon" variant="outline" value="default" />
      <CopyButton size="icon-lg" variant="outline" value="lg" />
    </div>
  );
}
