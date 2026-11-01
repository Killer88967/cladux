import { Label, Switch } from "@cladux/ui";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Switch id="switch-demo-airplane" />
        <Label htmlFor="switch-demo-airplane">Airplane Mode</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-demo-small" size="sm" defaultChecked />
        <Label htmlFor="switch-demo-small">Small</Label>
      </div>
    </div>
  );
}
