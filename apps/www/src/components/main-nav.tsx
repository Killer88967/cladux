"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@cladux/utils";
import { mainNav } from "@/lib/site";

/** True when `href` is the current section. Components wins over Docs on its own pages. */
export function isActive(pathname: string, href: string) {
  if (href === "/docs")
    return pathname.startsWith("/docs") && !pathname.startsWith("/docs/components");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("items-center gap-0.5", className)}>
      {mainNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={isActive(pathname, item.href) || undefined}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground data-active:text-foreground"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
