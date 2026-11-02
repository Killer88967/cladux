import type { Metadata } from "next";
import { MailExample } from "@/components/examples/mail";

export const metadata: Metadata = { title: "Mail example" };

export default function Page() {
  return <MailExample />;
}
