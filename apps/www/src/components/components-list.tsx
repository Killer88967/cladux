import Link from "next/link";
import { NewBadge } from "@/components/docs-sidebar";
import { getNav } from "@/lib/docs";

/**
 * Component pages as a grid of links, from the same data as the sidebar.
 * `only="new"` lists just the ones marked `new: true` in their metadata.
 */
export async function ComponentsList({ only }: { only?: "new" }) {
  const nav = await getNav();
  const all = nav.find((group) => group.title === "Components")?.items ?? [];
  const items = only === "new" ? all.filter((item) => item.isNew) : all;

  return (
    <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 md:gap-x-16 lg:gap-x-20">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        >
          {item.title}
          {item.isNew && <NewBadge />}
        </Link>
      ))}
    </div>
  );
}
