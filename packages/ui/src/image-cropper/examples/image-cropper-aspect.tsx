"use client";

import * as React from "react";
import { type CropArea, ImageCropper, ToggleGroup, ToggleGroupItem } from "@cladux/ui";

const ratios = { "1:1": 1, "4:3": 4 / 3, "16:9": 16 / 9, "3:4": 3 / 4 };

export default function ImageCropperAspect() {
  const [ratio, setRatio] = React.useState<keyof typeof ratios>("16:9");
  const [area, setArea] = React.useState<CropArea | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        value={ratio}
        onValueChange={(value) => value && setRatio(value as keyof typeof ratios)}
      >
        {Object.keys(ratios).map((r) => (
          <ToggleGroupItem key={r} value={r}>
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ImageCropper
        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=80"
        alt="A bright meeting room"
        aspect={ratios[ratio]}
        crossOrigin="anonymous"
        onCropComplete={setArea}
      />
      <p className="font-mono text-xs text-muted-foreground">
        {area ? `x ${area.x}, y ${area.y}, ${area.width} × ${area.height} px` : "Loading…"}
      </p>
    </div>
  );
}
