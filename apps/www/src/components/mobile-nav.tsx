"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@cladux/ui";
import type { NavGroup } from "@/lib/docs";
import { mainNav } from "@/lib/site";
import { isActive } from "./main-nav";

export function MobileNav({ nav }: { nav: NavGroup[] }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close after navigating.
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Cladux</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto p-4 text-sm">
          <nav className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(pathname, item.href) || undefined}
                className="rounded-md px-2 py-1.5 text-base font-medium hover:bg-muted data-active:bg-muted"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          {nav.map((group) => (
            <div key={group.title} className="flex flex-col gap-0.5">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={pathname === item.href || undefined}
                  className="rounded-md px-2 py-1 text-foreground/80 hover:bg-muted hover:text-foreground data-active:bg-muted data-active:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
