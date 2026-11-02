import { NumberInput } from "@cladux/ui";

export default function NumberInputStates() {
  return (
    <div className="grid w-full max-w-48 gap-3">
      <NumberInput aria-label="Default" placeholder="Default" />
      <NumberInput aria-label="Disabled" defaultValue={4} disabled />
      <NumberInput aria-label="Invalid" defaultValue={120} aria-invalid="true" />
    </div>
  );
}
