"use client";

import * as React from "react";
import {
  Button,
  ColorPicker,
  ColorPickerArea,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerSwatches,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cladux/ui";

const presets = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function ColorPickerPopover() {
  const [color, setColor] = React.useState("#3b82f6");

  return (
    <div className="grid gap-2">
      <Label htmlFor="color-picker-popover">Brand color</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button id="color-picker-popover" variant="outline" className="w-40 justify-start font-mono">
            <ColorPickerSwatch color={color} />
            {color.toUpperCase()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <ColorPicker value={color} onValueChange={setColor}>
            <ColorPickerArea className="h-36" />
            <ColorPickerHue />
            <ColorPickerSwatches colors={presets} />
            <ColorPickerInput />
          </ColorPicker>
        </PopoverContent>
      </Popover>
    </div>
  );
}
