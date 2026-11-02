import { Stat, StatDelta, StatHeader, StatLabel, StatSparkline, StatValue } from "../stat/stat";

const stats = [
  {
    label: "Customers",
    value: "12,480",
    delta: "+14%",
    trend: "up",
    data: [4, 6, 5, 8, 7, 10, 12],
  },
  { label: "Uptime", value: "99.99%", delta: "0%", trend: "neutral", data: [9, 9, 9, 9, 9, 9, 9] },
  {
    label: "Avg. response",
    value: "84 ms",
    delta: "−12 ms",
    trend: "down",
    data: [12, 11, 11, 9, 10, 8, 7],
    invert: true,
  },
  { label: "Countries", value: "68", delta: "+5", trend: "up", data: [50, 52, 55, 58, 60, 63, 68] },
] as const;

export default function Stats01() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight">Trusted at scale</h2>
        <p className="mt-1 text-muted-foreground">The numbers, updated every hour.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Stat key={stat.label}>
              <StatHeader>
                <StatLabel>{stat.label}</StatLabel>
                <StatDelta trend={stat.trend} invert={"invert" in stat}>
                  {stat.delta}
                </StatDelta>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatSparkline data={[...stat.data]} className="mt-2" />
            </Stat>
          ))}
        </div>
      </div>
    </section>
  );
}
