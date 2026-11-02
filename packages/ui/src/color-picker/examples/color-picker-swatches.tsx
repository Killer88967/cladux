"use client";

import * as React from "react";
import { ColorPicker, ColorPickerSwatches } from "@cladux/ui";

const colors = [
  "#0f172a",
  "#64748b",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

export default function ColorPickerSwatchesDemo() {
  const [color, setColor] = React.useState("#6366f1");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="size-16 rounded-xl shadow-sm" style={{ backgroundColor: color }} />
      <ColorPicker value={color} onValueChange={setColor} className="w-auto">
        <ColorPickerSwatches colors={colors} className="grid grid-cols-6" />
      </ColorPicker>
    </div>
  );
}
