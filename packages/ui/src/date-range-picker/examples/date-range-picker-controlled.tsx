"use client";

import * as React from "react";
import { DateRangePicker, type DateRange } from "@cladux/ui";

export default function DateRangePickerControlled() {
  const [range, setRange] = React.useState<DateRange | undefined>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: today };
  });
  const days =
    range?.from && range.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000) + 1
      : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <DateRangePicker value={range} onValueChange={setRange} numberOfMonths={1} className="w-72" />
      <p className="text-sm text-muted-foreground">
        {days ? `Showing ${days} day${days === 1 ? "" : "s"} of data` : "Pick a start and an end"}
      </p>
    </div>
  );
}
