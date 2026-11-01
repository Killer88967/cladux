import { Checkbox, Label } from "@cladux/ui";

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-demo-terms" />
        <Label htmlFor="checkbox-demo-terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="checkbox-demo-notify" defaultChecked />
        <div className="grid gap-2">
          <Label htmlFor="checkbox-demo-notify">Enable notifications</Label>
          <p className="text-sm text-muted-foreground">You can turn these off at any time.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-demo-disabled" disabled />
        <Label htmlFor="checkbox-demo-disabled">Disabled</Label>
      </div>
    </div>
  );
}
