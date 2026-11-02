import type { Metadata } from "next";
import { DashboardExample } from "@/components/examples/dashboard";

export const metadata: Metadata = { title: "Dashboard example" };

export default function Page() {
  return <DashboardExample />;
}
