"use client";

import * as React from "react";
import { Label, NumberInput } from "@cladux/ui";

export default function NumberInputStep() {
  const [value, setValue] = React.useState<number | null>(2.5);

  return (
    <div className="grid w-full max-w-48 gap-2">
      <Label htmlFor="number-input-step">Weight (kg)</Label>
      <NumberInput
        id="number-input-step"
        value={value}
        onValueChange={setValue}
        min={0}
        max={20}
        step={0.5}
      />
      <p className="text-xs text-muted-foreground">Value: {value ?? "empty"}</p>
    </div>
  );
}
