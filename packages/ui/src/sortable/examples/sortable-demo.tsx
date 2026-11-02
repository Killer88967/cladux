"use client";

import * as React from "react";
import { Checkbox, Sortable, SortableHandle, SortableItem } from "@cladux/ui";

const initial = [
  { id: "1", title: "Write the announcement", done: true },
  { id: "2", title: "Record the demo video", done: false },
  { id: "3", title: "Update the pricing page", done: false },
  { id: "4", title: "Email the beta testers", done: false },
  { id: "5", title: "Publish to npm", done: false },
];

export default function SortableDemo() {
  const [tasks, setTasks] = React.useState(initial);

  return (
    <Sortable value={tasks} onValueChange={setTasks} className="w-full max-w-sm gap-1.5">
      {tasks.map((task) => (
        <SortableItem
          key={task.id}
          id={task.id}
          className="flex items-center gap-2 rounded-lg border bg-card py-1.5 ps-1.5 pe-3 text-sm"
        >
          <SortableHandle />
          <Checkbox
            checked={task.done}
            aria-label={`Mark "${task.title}" done`}
            onCheckedChange={(done) =>
              setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: done === true } : t)))
            }
          />
          <span className={task.done ? "text-muted-foreground line-through" : undefined}>
            {task.title}
          </span>
        </SortableItem>
      ))}
    </Sortable>
  );
}
