"use client";

import * as React from "react";
import { RelativeTime } from "@cladux/ui";

export default function RelativeTimeDemo() {
  // Fixed once on mount so the examples keep their distance from now.
  const [now] = React.useState(() => Date.now());
  const items = [
    { label: "Commented", at: now - 20 * 1000 },
    { label: "Edited", at: now - 7 * 60 * 1000 },
    { label: "Deployed", at: now - 3 * 60 * 60 * 1000 },
    { label: "Created", at: now - 26 * 60 * 60 * 1000 },
    { label: "Renews", at: now + 12 * 24 * 60 * 60 * 1000 },
  ];

  return (
    <ul className="grid w-full max-w-xs gap-2 text-sm">
      {items.map((item) => (
        <li key={item.label} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{item.label}</span>
          <RelativeTime date={item.at} />
        </li>
      ))}
    </ul>
  );
}
