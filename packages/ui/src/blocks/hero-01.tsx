import { ArrowRightIcon, PlayIcon } from "lucide-react";

import { Badge } from "../badge/badge";
import { Button } from "../button/button";

export default function Hero01() {
  return (
    <section className="overflow-hidden px-4 py-20 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Badge variant="secondary" className="mb-5 gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" /> New: workflows are here
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Ship your product faster than your roadmap
        </h1>
        <p className="mt-5 max-w-xl text-lg text-balance text-muted-foreground">
          Acme brings planning, docs and releases into one place, so your team spends less time
          syncing and more time building.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">
            Start for free <ArrowRightIcon />
          </Button>
          <Button size="lg" variant="outline">
            <PlayIcon /> Watch the demo
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card needed. Free for up to 5 people.
        </p>
      </div>
      <div className="relative mx-auto mt-16 max-w-5xl">
        <div className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
        <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="flex h-9 items-center gap-1.5 border-b px-4">
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {[
              ["Active projects", "24", "+3 this week"],
              ["Open issues", "112", "−18 since Monday"],
              ["Releases", "9", "2 scheduled"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-lg border p-4 text-left">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
            <div className="rounded-lg border p-4 sm:col-span-3">
              <div className="flex h-32 items-end gap-2">
                {[40, 65, 45, 80, 60, 90, 70, 100, 85, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
