"use client";

import * as React from "react";
import {
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  ColorPicker,
  ColorPickerArea,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerSwatches,
  Countdown,
  Rating,
  Sortable,
  SortableHandle,
  SortableItem,
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  Textarea,
  TreeView,
  type TreeNode,
} from "@cladux/ui";

export function TaskList() {
  const [tasks, setTasks] = React.useState([
    { id: "1", title: "Review the pull request", done: true },
    { id: "2", title: "Write release notes", done: false },
    { id: "3", title: "Update the screenshots", done: false },
    { id: "4", title: "Tag v2.1.0", done: false },
  ]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>Drag to reorder, or focus a handle and press Space.</CardDescription>
      </CardHeader>
      <CardContent>
        <Sortable value={tasks} onValueChange={setTasks} className="gap-1.5">
          {tasks.map((task) => (
            <SortableItem
              key={task.id}
              id={task.id}
              className="flex items-center gap-2 rounded-lg border bg-background py-1 ps-1 pe-3 text-sm"
            >
              <SortableHandle />
              <Checkbox
                checked={task.done}
                aria-label={task.title}
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
      </CardContent>
    </Card>
  );
}

const files: TreeNode[] = [
  {
    id: "app",
    name: "app",
    children: [
      { id: "app/layout.tsx", name: "layout.tsx" },
      { id: "app/page.tsx", name: "page.tsx" },
    ],
  },
  {
    id: "components",
    name: "components",
    children: [
      {
        id: "components/cl",
        name: "cl",
        children: [
          { id: "components/cl/button.tsx", name: "button.tsx" },
          { id: "components/cl/kanban.tsx", name: "kanban.tsx" },
        ],
      },
    ],
  },
  { id: "cl.json", name: "cl.json" },
];

export function FileExplorer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explorer</CardTitle>
        <CardDescription>Arrow keys, Enter and type-to-find.</CardDescription>
      </CardHeader>
      <CardContent>
        <TreeView
          aria-label="Project files"
          data={files}
          defaultExpanded={["app", "components", "components/cl"]}
          defaultSelectedId="components/cl/kanban.tsx"
        />
      </CardContent>
    </Card>
  );
}

export function BrandColor() {
  const [color, setColor] = React.useState("#6d5dfc");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Brand color
          <span className="size-5 rounded-md shadow-sm" style={{ backgroundColor: color }} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ColorPicker value={color} onValueChange={setColor}>
          <ColorPickerArea className="h-28" />
          <ColorPickerHue />
          <ColorPickerSwatches
            colors={["#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6d5dfc", "#ec4899"]}
          />
          <ColorPickerInput />
        </ColorPicker>
      </CardContent>
    </Card>
  );
}

export function Review() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate your experience</CardTitle>
        <CardDescription>It takes ten seconds and helps a lot.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Rating defaultValue={4} size="lg" aria-label="Your rating" />
        <Textarea placeholder="What could be better?" className="min-h-20" />
        <Button className="justify-self-end">Send feedback</Button>
      </CardContent>
    </Card>
  );
}

export function Onboarding() {
  const [step, setStep] = React.useState(2);
  const steps = ["Account", "Workspace", "Invite"];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your workspace</CardTitle>
        <CardDescription>Step {Math.min(step, 3)} of 3</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Stepper value={step} onValueChange={setStep}>
          {steps.map((title, i) => (
            <StepperItem key={title} step={i + 1}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
              {i < steps.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
          <Button size="sm" disabled={step > 3} onClick={() => setStep(step + 1)}>
            {step >= 3 ? "Finish" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Launch() {
  // Fixed once, so the countdown keeps its distance from when the page opened.
  const [target] = React.useState(() => Date.now() + (3 * 86400 + 7 * 3600 + 25 * 60) * 1000);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Launch week <Badge>Soon</Badge>
        </CardTitle>
        <CardDescription>New blocks, every day for a week.</CardDescription>
      </CardHeader>
      <CardContent>
        <Countdown target={target} className="justify-between" />
      </CardContent>
    </Card>
  );
}

export function Schedule() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  // "Today" depends on the viewer's clock and time zone, which the server can't
  // know, so the calendar renders in the browser only.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <Card className="py-3">
      <CardContent className="flex justify-center px-3">
        {mounted ? (
          <Calendar mode="single" selected={date} onSelect={setDate} className="p-0" />
        ) : (
          <div className="h-60 w-full" aria-hidden />
        )}
      </CardContent>
    </Card>
  );
}
