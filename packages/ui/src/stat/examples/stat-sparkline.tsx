import { Stat, StatDelta, StatHeader, StatLabel, StatSparkline, StatValue } from "@cladux/ui";

const visitors = [320, 410, 380, 520, 490, 610, 580, 720, 690, 840, 810, 960];
const latency = [180, 175, 190, 210, 240, 230, 260, 250, 280, 300, 290, 320];

export default function StatSparklineDemo() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Stat>
        <StatHeader>
          <StatLabel>Visitors</StatLabel>
          <StatDelta trend="up">+18%</StatDelta>
        </StatHeader>
        <StatValue>9,630</StatValue>
        <StatSparkline data={visitors} className="mt-2 text-emerald-600 dark:text-emerald-500" />
      </Stat>
      <Stat>
        <StatHeader>
          <StatLabel>p95 latency</StatLabel>
          <StatDelta trend="up" invert>
            +42 ms
          </StatDelta>
        </StatHeader>
        <StatValue>320 ms</StatValue>
        <StatSparkline data={latency} className="mt-2 text-destructive" />
      </Stat>
    </div>
  );
}
