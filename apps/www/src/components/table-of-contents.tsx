"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@cladux/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

/** "On this page": built from the h2/h3 headings of the current doc. */
export function TableOfContents() {
  const pathname = usePathname();
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [active, setActive] = React.useState<string>();

  React.useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>("[data-doc] :is(h2, h3)[id]")];
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H3" ? 3 : 2,
      })),
    );
    setActive(elements[0]?.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="text-xs font-medium text-muted-foreground">On This Page</p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          data-active={active === heading.id || undefined}
          className={cn(
            "text-muted-foreground transition-colors hover:text-foreground data-active:text-foreground",
            heading.level === 3 && "pl-4",
          )}
        >
          {heading.text}
        </a>
      ))}
    </div>
  );
}
