"use client";

import { BellIcon, PlusIcon, SearchIcon } from "lucide-react";
import * as React from "react";
import { Button, Input, Tour, type TourStep } from "@cladux/ui";

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);
  const search = React.useRef<HTMLDivElement>(null);
  const create = React.useRef<HTMLButtonElement>(null);
  const bell = React.useRef<HTMLButtonElement>(null);

  const steps: TourStep[] = [
    {
      title: "Welcome to your workspace",
      content: "Here's a 30-second look around. Use the arrow keys or the buttons.",
    },
    {
      target: search,
      title: "Search everything",
      content: "Find projects, people and files. Press / from anywhere.",
    },
    {
      target: create,
      title: "Create a project",
      content: "Start from scratch or from a template.",
      side: "bottom",
      align: "end",
    },
    {
      target: bell,
      title: "Stay in the loop",
      content: "Mentions and reviews show up here.",
      side: "left",
    },
  ];

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <div ref={search} className="relative flex-1">
          <SearchIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="ps-8" />
        </div>
        <Button ref={create}>
          <PlusIcon /> New project
        </Button>
        <Button ref={bell} variant="ghost" size="icon" aria-label="Notifications">
          <BellIcon />
        </Button>
      </div>
      <Button variant="outline" className="self-center" onClick={() => setOpen(true)}>
        Start tour
      </Button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  );
}
