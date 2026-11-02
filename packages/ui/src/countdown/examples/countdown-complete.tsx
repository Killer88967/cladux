"use client";

import * as React from "react";
import { Button, Countdown } from "@cladux/ui";

export default function CountdownComplete() {
  const [target, setTarget] = React.useState(() => Date.now() + 10_000);

  return (
    <div className="flex flex-col items-center gap-4">
      <Countdown target={target}>
        <p className="text-sm font-medium">The sale has started.</p>
      </Countdown>
      <Button size="sm" variant="outline" onClick={() => setTarget(Date.now() + 10_000)}>
        Restart
      </Button>
    </div>
  );
}
