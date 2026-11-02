import { Label, NumberInput } from "@cladux/ui";

export default function NumberInputDemo() {
  return (
    <div className="grid w-full max-w-48 gap-2">
      <Label htmlFor="number-input-demo">Quantity</Label>
      <NumberInput id="number-input-demo" defaultValue={1} min={1} max={99} />
    </div>
  );
}
