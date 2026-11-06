"use client";

import { Label, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import { ChartContainer, type ChartConfig } from "../chart/chart";

const used = 72;
const data = [{ name: "storage", used, fill: "var(--color-storage)" }];

const config = {
  storage: { label: "Storage", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function ChartRadial01() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle>Storage</CardTitle>
        <CardDescription>72 GB of 100 GB used</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={-270}
            innerRadius={80}
            outerRadius={110}
          >
            {/* A fixed 0 to 100 scale, so the ring fills to the percentage. */}
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="used" background cornerRadius={10} />
            <Label
              content={({ viewBox }) =>
                viewBox && "cx" in viewBox && "cy" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-4xl font-bold"
                    >
                      {used}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 26}
                      className="fill-muted-foreground"
                    >
                      Used
                    </tspan>
                  </text>
                ) : null
              }
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
