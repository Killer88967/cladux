"use client";

import * as React from "react";
import { Button, ImageCompare } from "@cladux/ui";

const photo =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80";

export default function ImageCompareControlled() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ImageCompare
        value={value}
        onValueChange={setValue}
        className="aspect-video w-full"
        before={<img src={photo} alt="An office, in sepia" className="sepia" />}
        after={<img src={photo} alt="The same office, in color" />}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setValue(0)}>
          After
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue(50)}>
          Half
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue(100)}>
          Before
        </Button>
        <span className="ms-auto text-sm text-muted-foreground tabular-nums">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}
