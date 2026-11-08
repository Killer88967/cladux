"use client";

import * as React from "react";
import { Label, Slider } from "@cladux/ui";

export function SliderControlled() {
  const [value, setValue] = React.useState([0.3, 0.7]);

  return (
    <div className="mx-auto grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label id="slider-demo-temperature-label">Temperature</Label>
        <span className="text-sm text-muted-foreground">{value.join(", ")}</span>
      </div>
      <Slider
        aria-labelledby="slider-demo-temperature-label"
        value={value}
        onValueChange={setValue}
        min={0}
        max={1}
        step={0.1}
      />
    </div>
  );
}
