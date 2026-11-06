export interface ChartMeta {
  name: string;
  title: string;
  description: string;
  type: "Area" | "Bar" | "Line" | "Pie" | "Radar" | "Radial";
}

export const charts: ChartMeta[] = [
  {
    name: "chart-area-01",
    title: "Stacked area",
    description: "Two series stacked, with gradient fills and a trend in the footer.",
    type: "Area",
  },
  {
    name: "chart-bar-01",
    title: "Grouped bars",
    description: "Two series side by side each month, with a legend.",
    type: "Bar",
  },
  {
    name: "chart-line-01",
    title: "Lines with dots",
    description: "Two series as lines, with a dot on each point.",
    type: "Line",
  },
  {
    name: "chart-pie-01",
    title: "Donut with a total",
    description: "A donut chart with the total in the middle.",
    type: "Pie",
  },
  {
    name: "chart-radar-01",
    title: "Radar",
    description: "Two series compared across six categories.",
    type: "Radar",
  },
  {
    name: "chart-radial-01",
    title: "Radial progress",
    description: "One value as a ring, for usage and goals.",
    type: "Radial",
  },
];
