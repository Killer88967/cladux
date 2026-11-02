"use client";

import * as React from "react";
import { useCountdown } from "@cladux/ui";

export default function CountdownCustom() {
  const [target] = React.useState(() => Date.now() + (3 * 60 * 60 + 14 * 60) * 1000);
  const time = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-lg border px-4 py-3 text-sm">
      Offer ends in{" "}
      <span className="font-mono font-medium tabular-nums">
        {time ? `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}` : "--:--:--"}
      </span>
    </div>
  );
}
