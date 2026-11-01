import Link from "next/link";
import { Button } from "@cladux/ui";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getNav } from "@/lib/docs";

export async function SiteHeader() {
  const nav = await getNav();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="cl-container flex h-14 items-center gap-2">
        <Link href="/" className="mr-4 hidden font-semibold sm:block">
          Cladux
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/docs">Docs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/docs/components">Components</Link>
          </Button>
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
          <div className="w-full max-w-56">
            <CommandMenu nav={nav} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
