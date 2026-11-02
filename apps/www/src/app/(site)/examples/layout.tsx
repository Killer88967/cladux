import type { ReactNode } from "react";
import { ExamplesNav } from "@/components/examples-nav";
import { PageHeader } from "@/components/page-header";

export default function ExamplesLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <PageHeader
        title="Examples"
        description="Whole app screens built only from Cladux components. Open the source to see how they fit together."
        className="pb-8 md:pb-10"
      />
      <div className="cl-container pb-16">
        <ExamplesNav className="mb-4" />
        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">{children}</div>
      </div>
    </main>
  );
}
