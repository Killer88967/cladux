import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@cladux/ui";
import { charts } from "@cladux/ui/charts/_charts";
import { ChartCard } from "@/components/chart-card";
import { PageHeader } from "@/components/page-header";
import { chartComponents } from "@/lib/charts.generated";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "Ready-made charts built on Recharts and Cladux's Chart component, ready to add with the CLI.",
};

const REPO_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "../..");

/** The chart's source as it lands in a project: imports point at your components. */
async function source(name: string) {
  const raw = await readFile(path.join(REPO_ROOT, "packages/ui/src/charts", `${name}.tsx`), "utf8");
  return raw.replace(/from "\.\.\/[\w-]+\/([\w-]+)"/g, 'from "@/components/cl/$1"').trim();
}

export default async function ChartsPage() {
  const withCode = await Promise.all(
    charts.map(async (chart) => {
      const code = await source(chart.name);
      const html = await highlight(code);
      return { ...chart, code, html };
    }),
  );

  return (
    <main>
      <PageHeader
        title="Beautiful charts, ready to use"
        description="Area, bar, line, pie, radar and radial charts in cards, built on Recharts and the Chart component. They follow your theme's chart colors. Add one with a single command, then swap in your data."
      >
        <Button asChild>
          <a href={`#${charts[0]!.name}`}>Browse charts</a>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/docs/components/chart">Chart docs</Link>
        </Button>
      </PageHeader>
      <div className="cl-container grid gap-x-6 gap-y-10 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {withCode.map(({ name, title, type, code, html }) => {
          const Chart = chartComponents[name]!;
          return (
            <ChartCard key={name} {...{ name, title, type, code, html }}>
              <Chart />
            </ChartCard>
          );
        })}
      </div>
    </main>
  );
}
