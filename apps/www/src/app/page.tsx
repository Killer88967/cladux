import Link from "next/link";
import { tokens } from "@cladux/tokens";
import { Button } from "@cladux/ui";

const colors = Object.keys(tokens.themes.neutral.light);

export default function Home() {
  return (
    <main className="cl-container py-16">
      <section className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Cladux</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Components, CSS and TypeScript utilities for building websites. Built on shadcn/ui, with
          more on top.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/docs">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs/components/button">Components</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Theme</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {colors.map((name) => (
            <div key={name} className="space-y-1.5">
              <div className="h-12 rounded-md border" style={{ background: `var(--${name})` }} />
              <p className="font-mono text-xs text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
