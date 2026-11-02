import { Stat, StatDelta, StatDescription, StatLabel, StatValue } from "@cladux/ui";

export default function StatDemo() {
  return (
    <Stat className="w-full max-w-64">
      <StatLabel>Monthly revenue</StatLabel>
      <StatValue>$48,290</StatValue>
      <StatDescription>
        <StatDelta trend="up">12.4%</StatDelta>
        vs. last month
      </StatDescription>
    </Stat>
  );
}
