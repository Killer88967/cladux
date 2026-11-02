"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanItem,
} from "@cladux/ui";

interface Task {
  id: string;
  title: string;
  tag: string;
  owner: string;
}

const titles: Record<string, string> = { todo: "To do", doing: "In progress", done: "Done" };

const initial: Record<string, Task[]> = {
  todo: [
    { id: "t1", title: "Design the onboarding flow", tag: "Design", owner: "AL" },
    { id: "t2", title: "Rate limit the public API", tag: "Backend", owner: "GH" },
    { id: "t3", title: "Write the migration guide", tag: "Docs", owner: "LT" },
  ],
  doing: [
    { id: "t4", title: "Kanban component", tag: "Frontend", owner: "AL" },
    { id: "t5", title: "Fix the flaky login test", tag: "QA", owner: "KJ" },
  ],
  done: [{ id: "t6", title: "Set up the CI cache", tag: "DevOps", owner: "GH" }],
};

export default function KanbanDemo() {
  const [columns, setColumns] = React.useState(initial);

  return (
    <Kanban value={columns} onValueChange={setColumns} className="w-full max-w-3xl">
      {Object.entries(columns).map(([column, tasks]) => (
        <KanbanColumn key={column} id={column} className="w-auto min-w-44 flex-1">
          <KanbanColumnHeader>
            <KanbanColumnTitle>
              {titles[column]}
              <Badge variant="secondary" className="tabular-nums">
                {tasks.length}
              </Badge>
            </KanbanColumnTitle>
          </KanbanColumnHeader>
          <KanbanColumnContent>
            {tasks.map((task) => (
              <KanbanItem key={task.id} id={task.id} className="flex flex-col gap-2">
                <span className="font-medium">{task.title}</span>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{task.tag}</Badge>
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{task.owner}</AvatarFallback>
                  </Avatar>
                </div>
              </KanbanItem>
            ))}
          </KanbanColumnContent>
        </KanbanColumn>
      ))}
    </Kanban>
  );
}
