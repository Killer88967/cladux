"use client";

import * as React from "react";
import { RotateCcwIcon } from "lucide-react";
import { AnimatedText, Button, ToggleGroup, ToggleGroupItem } from "@cladux/ui";

const effects = ["fade-up", "blur-in", "mask", "pop", "typewriter"] as const;

export default function AnimatedTextDemo() {
  const [effect, setEffect] = React.useState<(typeof effects)[number]>("blur-in");
  const [run, setRun] = React.useState(0);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-8">
      <h2 className="min-h-[2lh] text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        <AnimatedText key={`${effect}-${run}`} effect={effect} trigger="mount">
          Components that ship with more than the basics
        </AnimatedText>
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={effect}
          onValueChange={(value) => value && setEffect(value as typeof effect)}
        >
          {effects.map((name) => (
            <ToggleGroupItem key={name} value={name}>
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Replay"
          onClick={() => setRun((r) => r + 1)}
        >
          <RotateCcwIcon />
        </Button>
      </div>
    </div>
  );
}
