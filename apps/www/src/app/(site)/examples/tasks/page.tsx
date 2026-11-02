import type { Metadata } from "next";
import { TasksExample } from "@/components/examples/tasks";

export const metadata: Metadata = { title: "Tasks example" };

export default function Page() {
  return <TasksExample />;
}
