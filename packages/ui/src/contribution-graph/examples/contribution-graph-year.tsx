"use client";

import * as React from "react";
import { ContributionGraph, type ContributionGraphDay } from "@cladux/ui";

function activity(days = 365) {
  let seed = 42;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i),
    count: random() < 0.35 ? 0 : Math.round(random() ** 3 * 15),
  }));
}

export default function ContributionGraphInteractive() {
  const data = React.useMemo(() => activity(), []);
  const [day, setDay] = React.useState<ContributionGraphDay | null>(null);

  return (
    <div className="flex w-full flex-col gap-3">
      <ContributionGraph
        data={data}
        thresholds={[1, 3, 6, 10]}
        formatDay={(d, date) => `${d.count || "No"} commit${d.count === 1 ? "" : "s"} on ${date}`}
        summary={(total) => `${total} commits in the last year`}
        onDayClick={setDay}
      />
      <p className="text-sm text-muted-foreground">
        {day
          ? `${day.date.toLocaleDateString(undefined, { dateStyle: "medium" })}: ${day.count} commits`
          : "Click a day to see its commits."}
      </p>
    </div>
  );
}
