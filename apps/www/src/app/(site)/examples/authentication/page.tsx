import type { Metadata } from "next";
import { AuthenticationExample } from "@/components/examples/authentication";

export const metadata: Metadata = { title: "Authentication example" };

export default function Page() {
  return <AuthenticationExample />;
}
