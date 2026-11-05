import { NumberTicker } from "@cladux/ui";

export default function NumberTickerDemo() {
  return (
    <div className="flex flex-col items-center gap-1">
      <NumberTicker value={12480} className="text-5xl font-semibold tracking-tight" />
      <p className="text-sm text-muted-foreground">downloads this month</p>
    </div>
  );
}
