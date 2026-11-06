"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../chart/chart";

const data = [
  { month: "January", signups: 186, upgrades: 80 },
  { month: "February", signups: 305, upgrades: 200 },
  { month: "March", signups: 237, upgrades: 120 },
  { month: "April", signups: 273, upgrades: 190 },
  { month: "May", signups: 209, upgrades: 130 },
  { month: "June", signups: 314, upgrades: 240 },
];

const config = {
  signups: { label: "Sign-ups", color: "var(--chart-1)" },
  upgrades: { label: "Upgrades", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ChartLine01() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth</CardTitle>
        <CardDescription>Sign-ups and upgrades, January to June</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {(["signups", "upgrades"] as const).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={{ fill: `var(--color-${key})` }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
