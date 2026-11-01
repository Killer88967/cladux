"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@cladux/utils";
import { Badge } from "@cladux/ui";
import type { NavGroup } from "@/lib/docs";

export function DocsSidebar({ nav }: { nav: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 text-sm">
      {nav.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={pathname === item.href || undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
                "data-active:bg-muted data-active:text-foreground",
              )}
            >
              {item.title}
              {item.isNew && <NewBadge />}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function NewBadge() {
  return (
    <Badge variant="secondary" className="h-4 px-1.5 text-[0.625rem]">
      New
    </Badge>
  );
}
