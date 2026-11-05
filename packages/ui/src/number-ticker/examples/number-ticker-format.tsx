import { NumberTicker } from "@cladux/ui";

export default function NumberTickerFormat() {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-4 text-center">
      <div>
        <NumberTicker
          value={48295.5}
          format={{ style: "currency", currency: "USD" }}
          className="text-2xl font-semibold"
        />
        <p className="text-sm text-muted-foreground">Revenue</p>
      </div>
      <div>
        <NumberTicker
          value={0.999}
          format={{ style: "percent", maximumFractionDigits: 1 }}
          className="text-2xl font-semibold"
        />
        <p className="text-sm text-muted-foreground">Uptime</p>
      </div>
      <div>
        <NumberTicker
          value={1200000}
          format={{ notation: "compact" }}
          suffix="+"
          className="text-2xl font-semibold"
        />
        <p className="text-sm text-muted-foreground">Users</p>
      </div>
    </div>
  );
}
