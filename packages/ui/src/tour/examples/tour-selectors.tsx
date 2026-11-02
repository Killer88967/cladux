"use client";

import * as React from "react";
import { Button, Tour } from "@cladux/ui";

export default function TourSelectors() {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
        <div id="tour-plan" className="rounded-lg border p-3">
          Plan
        </div>
        <div id="tour-build" className="rounded-lg border p-3">
          Build
        </div>
        <div id="tour-ship" className="rounded-lg border p-3">
          Ship
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
      >
        Show me how it works
      </Button>
      {done && <p className="text-sm text-muted-foreground">Tour finished.</p>}
      <Tour
        open={open}
        onOpenChange={setOpen}
        onComplete={() => setDone(true)}
        closeOnOverlayClick
        steps={[
          {
            target: "#tour-plan",
            title: "Plan",
            content: "Write down what you want to make.",
            side: "top",
          },
          {
            target: "#tour-build",
            title: "Build",
            content: "Add components with the CLI.",
            side: "top",
          },
          {
            target: "#tour-ship",
            title: "Ship",
            content: "Deploy and tell everyone.",
            side: "top",
          },
        ]}
      />
    </div>
  );
}
