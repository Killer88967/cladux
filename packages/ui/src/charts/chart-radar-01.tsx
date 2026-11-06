"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../chart/chart";

const data = [
  { skill: "Speed", current: 186, target: 160 },
  { skill: "Quality", current: 305, target: 260 },
  { skill: "Support", current: 237, target: 280 },
  { skill: "Docs", current: 173, target: 220 },
  { skill: "Design", current: 209, target: 230 },
  { skill: "Price", current: 214, target: 200 },
];

const config = {
  current: { label: "This year", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ChartRadar01() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle>Customer ratings</CardTitle>
        <CardDescription>This year against the target</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-72">
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <PolarAngleAxis dataKey="skill" />
            <PolarGrid />
            <Radar dataKey="target" fill="var(--color-target)" fillOpacity={0.3} />
            <Radar dataKey="current" fill="var(--color-current)" fillOpacity={0.6} />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
