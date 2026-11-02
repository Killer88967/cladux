import { Label, TagsInput } from "@cladux/ui";

export default function TagsInputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="tags-input-demo">Topics</Label>
      <TagsInput
        id="tags-input-demo"
        defaultValue={["react", "tailwind"]}
        placeholder="Add a topic..."
      />
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a topic.</p>
    </div>
  );
}
