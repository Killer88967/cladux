import type { Metadata } from "next";
import { SettingsExample } from "@/components/examples/settings";

export const metadata: Metadata = { title: "Settings example" };

export default function Page() {
  return <SettingsExample />;
}
