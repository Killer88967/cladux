"use client";

import * as React from "react";
import { Countdown } from "@cladux/ui";

export default function CountdownDemo() {
  const [target] = React.useState(
    () => Date.now() + (2 * 24 * 60 * 60 + 5 * 60 * 60 + 42 * 60) * 1000,
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium">Launch in</p>
      <Countdown target={target} />
    </div>
  );
}
