import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@cladux/utils";

/** The big heading block at the top of the home, blocks, examples, themes and colors pages. */
export function PageHeader({
  announcement,
  title,
  description,
  children,
  className,
}: {
  announcement?: { href: string; label: string };
  title: ReactNode;
  description?: ReactNode;
  /** Buttons under the description. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-3 px-4 py-12 text-center md:py-16 lg:py-20",
        className,
      )}
    >
      {announcement && (
        <Link
          href={announcement.href}
          className="group mb-1 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          {announcement.label}
          <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
      <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:leading-[1.1]">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
      {children && <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>}
    </section>
  );
}
