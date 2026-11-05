"use client";

import * as React from "react";
import { Button, NumberTicker } from "@cladux/ui";

export default function NumberTickerRoll() {
  const [value, setValue] = React.useState(2048);

  return (
    <div className="flex flex-col items-center gap-4">
      <NumberTicker effect="roll" value={value} className="text-5xl font-semibold tracking-tight" />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setValue(Math.floor(Math.random() * 9000) + 1000)}
      >
        Roll
      </Button>
    </div>
  );
}
