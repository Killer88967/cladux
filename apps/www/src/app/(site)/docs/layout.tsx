import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs-sidebar";
import { TableOfContents } from "@/components/table-of-contents";
import { getNav } from "@/lib/docs";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const nav = await getNav();

  return (
    <div className="cl-container grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_12rem]">
      <aside className="hidden md:block">
        <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-10">
          <DocsSidebar nav={nav} />
        </div>
      </aside>
      <article data-doc className="min-w-0 py-10">
        {children}
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-14 py-10">
          <TableOfContents />
        </div>
      </aside>
    </div>
  );
}
