"use client";

import * as React from "react";
import { Rating } from "@cladux/ui";

export default function RatingHalf() {
  const [value, setValue] = React.useState(3.5);

  return (
    <div className="flex flex-col items-center gap-2">
      <Rating value={value} onValueChange={setValue} allowHalf aria-label="Your rating" />
      <p className="text-sm text-muted-foreground tabular-nums">{value.toFixed(1)} / 5</p>
    </div>
  );
}
