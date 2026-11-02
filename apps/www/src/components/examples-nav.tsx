"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@cladux/utils";
import { exampleNav } from "@/lib/site";

/** Tabs for the example pages. On the home page, the first one shows as current. */
export function ExamplesNav({ className, home = false }: { className?: string; home?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Examples"
      className={cn("flex scrollbar-none items-center gap-1 overflow-x-auto", className)}
    >
      {exampleNav.map((item, i) => {
        const active = home ? i === 0 : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
