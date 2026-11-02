"use client";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  KanbanSquareIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  Input,
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "@cladux/ui";

type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  label: string;
  priority: Priority;
  owner: string;
}

const statuses = {
  backlog: "Backlog",
  todo: "To do",
  progress: "In progress",
  done: "Done",
} as const;

const initial: Record<keyof typeof statuses, Task[]> = {
  backlog: [
    {
      id: "TASK-8782",
      title: "Allow exporting reports as CSV",
      label: "Feature",
      priority: "medium",
      owner: "AL",
    },
    {
      id: "TASK-7878",
      title: "Audit color contrast on the pricing page",
      label: "Docs",
      priority: "low",
      owner: "GH",
    },
  ],
  todo: [
    {
      id: "TASK-7839",
      title: "Rate limit the public search endpoint",
      label: "Bug",
      priority: "high",
      owner: "LT",
    },
    {
      id: "TASK-5562",
      title: "Add SSO with Okta",
      label: "Feature",
      priority: "medium",
      owner: "AL",
    },
    {
      id: "TASK-8686",
      title: "Write the migration guide for v2",
      label: "Docs",
      priority: "medium",
      owner: "KJ",
    },
  ],
  progress: [
    {
      id: "TASK-1280",
      title: "Kanban view for the tasks page",
      label: "Feature",
      priority: "high",
      owner: "AL",
    },
    {
      id: "TASK-7262",
      title: "Fix the flaky login test",
      label: "Bug",
      priority: "high",
      owner: "GH",
    },
  ],
  done: [
    {
      id: "TASK-1138",
      title: "Cache dependencies in CI",
      label: "Chore",
      priority: "low",
      owner: "KJ",
    },
    {
      id: "TASK-7184",
      title: "Dark mode for emails",
      label: "Feature",
      priority: "medium",
      owner: "LT",
    },
  ],
};

const priorityIcon = { low: ArrowDownIcon, medium: ArrowRightIcon, high: ArrowUpIcon };

function PriorityLabel({ priority }: { priority: Priority }) {
  const Icon = priorityIcon[priority];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground capitalize">
      <Icon className="size-3.5" />
      {priority}
    </span>
  );
}

export function TasksExample() {
  const [columns, setColumns] = React.useState(initial);
  const [view, setView] = React.useState("board");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  const rows = Object.entries(columns).flatMap(([status, tasks]) =>
    tasks.map((task) => ({ ...task, status: status as keyof typeof statuses })),
  );
  const visible = rows.filter((row) =>
    `${row.id} ${row.title} ${row.label}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back!</h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what the team is working on this sprint.
          </p>
        </div>
        <Button>
          <PlusIcon /> New task
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-64">
          <SearchIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter tasks..."
            className="ps-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={view === "board"}
            aria-label="Filter tasks"
          />
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={view}
          onValueChange={(v) => v && setView(v)}
          className="ms-auto"
        >
          <ToggleGroupItem value="board" aria-label="Board view">
            <KanbanSquareIcon /> Board
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListIcon /> List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "board" ? (
        <Kanban value={columns} onValueChange={setColumns} className="pb-2">
          {Object.entries(columns).map(([status, tasks]) => (
            <KanbanColumn key={status} id={status} className="w-auto min-w-60 flex-1">
              <KanbanColumnHeader>
                <KanbanColumnTitle>
                  {statuses[status as keyof typeof statuses]}
                  <Badge variant="secondary" className="tabular-nums">
                    {tasks.length}
                  </Badge>
                </KanbanColumnTitle>
              </KanbanColumnHeader>
              <KanbanColumnContent>
                {tasks.map((task) => (
                  <KanbanItem key={task.id} id={task.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">{task.id}</span>
                      <PriorityLabel priority={task.priority} />
                    </div>
                    <span className="font-medium">{task.title}</span>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{task.label}</Badge>
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
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all"
                    checked={
                      visible.length > 0 && visible.every((r) => selected.includes(r.id))
                        ? true
                        : visible.some((r) => selected.includes(r.id))
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) =>
                      setSelected(checked === true ? visible.map((r) => r.id) : [])
                    }
                  />
                </TableHead>
                <TableHead className="w-28">Task</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-28">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selected.includes(row.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${row.id}`}
                      checked={selected.includes(row.id)}
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked === true
                            ? [...selected, row.id]
                            : selected.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{row.label}</Badge>
                      <span className="max-w-96 truncate font-medium">{row.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{statuses[row.status]}</TableCell>
                  <TableCell>
                    <PriorityLabel priority={row.priority} />
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No tasks match &ldquo;{query}&rdquo;.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {selected.length} of {rows.length} selected
          </div>
        </div>
      )}
    </div>
  );
}
