import { Separator } from "@cladux/ui";

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Cladux</h4>
        <p className="text-sm text-muted-foreground">Components, CSS and utilities.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Components</div>
        <Separator orientation="vertical" />
        <div>Themes</div>
      </div>
    </div>
  );
}
