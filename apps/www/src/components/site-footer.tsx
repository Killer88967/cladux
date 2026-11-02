import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="cl-container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          Built by {site.author}. The source is on{" "}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
        <nav className="flex gap-4">
          <Link href="/docs/changelog" className="hover:text-foreground">
            Changelog
          </Link>
          <Link href="/docs/installation" className="hover:text-foreground">
            Installation
          </Link>
        </nav>
      </div>
    </footer>
  );
}
