"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

/** One day of activity. `date` is a Date or a "YYYY-MM-DD" string, read as a local day. */
interface ContributionDay {
  date: Date | string;
  count: number;
}

/** A day on the graph, as the callbacks get it. */
interface ContributionGraphDay {
  date: Date;
  count: number;
  /** 0 for no activity, up to 4 for the most. */
  level: number;
}

interface ContributionGraphProps extends Omit<React.ComponentProps<"div">, "children"> {
  data: ContributionDay[];
  /** The last day shown. Defaults to today. Pass it when rendering on the server. */
  end?: Date;
  /** The first day shown. Defaults to a year before `end`. */
  start?: Date;
  /** The counts where levels 1 to 4 start, e.g. `[1, 5, 10, 20]`. Defaults to quarters of the busiest day. */
  thresholds?: [number, number, number, number];
  /** 0 starts weeks on Sunday, like GitHub; 1 on Monday. */
  weekStart?: 0 | 1;
  /** The locale for month and day names, such as "fr-FR". Defaults to the browser's. */
  locale?: string;
  /** The words for a day's tooltip and its screen reader label. */
  formatDay?: (day: ContributionGraphDay, date: string) => string;
  /** The line under the graph. `false` hides it. */
  summary?: ((total: number) => React.ReactNode) | false;
  /** Show the "Less ... More" key. */
  legend?: boolean;
  /** Makes the days buttons that call this when clicked. */
  onDayClick?: (day: ContributionGraphDay) => void;
}

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
/** "YYYY-MM-DD" in local time. */
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
/** "2026-03-04" as the local day, not midnight UTC (which is the day before in the Americas). */
const toDate = (value: Date | string) => {
  if (value instanceof Date) return startOfDay(value);
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};

/**
 * A year of activity as a grid of days, one column per week, like GitHub's.
 * Busier days are darker, in your theme's primary color. Tab reaches the
 * graph once, and the arrow keys move between days.
 */
function ContributionGraph({
  data,
  end: endProp,
  start: startProp,
  thresholds,
  weekStart = 0,
  locale,
  formatDay,
  summary,
  legend = true,
  onDayClick,
  className,
  ...props
}: ContributionGraphProps) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<number | null>(null);
  const [tip, setTip] = React.useState<{ text: string; x: number; y: number } | null>(null);

  const end = startOfDay(endProp ?? new Date());
  const start = startOfDay(startProp ?? addDays(end, -364));

  const { weeks, total, days } = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of data) {
      const key = dayKey(toDate(day.date));
      counts.set(key, (counts.get(key) ?? 0) + day.count);
    }

    // The days in range, and the busiest one for the default levels.
    let max = 0;
    let total = 0;
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const count = counts.get(dayKey(d)) ?? 0;
      max = Math.max(max, count);
      total += count;
    }
    const steps = thresholds ?? [1, max / 4, max / 2, (max * 3) / 4];
    const levelOf = (count: number) =>
      count <= 0 ? 0 : count >= steps[3] ? 4 : count >= steps[2] ? 3 : count >= steps[1] ? 2 : 1;

    // Columns of 7, starting on the week's first day; days outside the range stay empty.
    const first = addDays(start, -((start.getDay() - weekStart + 7) % 7));
    const weeks: (ContributionGraphDay | null)[][] = [];
    const days: ContributionGraphDay[] = [];
    for (let d = first; d <= end; d = addDays(d, 1)) {
      const index = Math.round((d.getTime() - first.getTime()) / DAY);
      const week = (weeks[Math.floor(index / 7)] ??= []);
      if (d < start) {
        week.push(null);
        continue;
      }
      const count = counts.get(dayKey(d)) ?? 0;
      const day = { date: d, count, level: levelOf(count) };
      week.push(day);
      days.push(day);
    }
    return { weeks, total, days };
    // Dates are compared by day, so a new Date for the same day doesn't recompute.
  }, [data, dayKey(start), dayKey(end), thresholds?.join(), weekStart]);

  const dateFormat = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [locale],
  );
  const monthFormat = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short" }),
    [locale],
  );
  const weekdayFormat = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );

  const describe = (day: ContributionGraphDay) => {
    const date = dateFormat.format(day.date);
    if (formatDay) return formatDay(day, date);
    const n = day.count === 0 ? "No" : day.count.toLocaleString(locale);
    return `${n} contribution${day.count === 1 ? "" : "s"} on ${date}`;
  };

  // A label over the first week of each month, unless it would crowd the one before.
  const months: { column: number; label: string }[] = [];
  weeks.forEach((week, column) => {
    const day = week.find((d) => d && d.date.getDate() <= 7);
    if (!day) return;
    const last = months.at(-1);
    if (last && column - last.column < 3) return;
    months.push({ column, label: monthFormat.format(day.date) });
  });

  // The tooltip is placed on the screen, so it would drift when the page scrolls.
  React.useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [tip]);

  // Start scrolled to the newest days when the graph is wider than its box.
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollLeft = rtl ? -el.scrollWidth : el.scrollWidth;
  }, [weeks.length]);

  // The day that Tab lands on: the one last focused, or the newest.
  const focusIndex = active ?? days.length - 1;

  const showTip = (index: number, el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    setTip({ text: describe(days[index]!), x: box.left + box.width / 2, y: box.top });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = {
      ArrowUp: -1,
      ArrowDown: 1,
      ArrowLeft: rtl ? 7 : -7,
      ArrowRight: rtl ? -7 : 7,
      Home: -Infinity,
      End: Infinity,
    }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = Math.min(days.length - 1, Math.max(0, focusIndex + step));
    setActive(next);
    const cell = event.currentTarget.querySelector<HTMLElement>(`[data-index="${next}"]`);
    cell?.focus();
    if (cell) showTip(next, cell);
  };

  const Cell = onDayClick ? "button" : "div";
  let index = -1;

  return (
    <div
      data-slot="contribution-graph"
      className={cn("flex w-full flex-col gap-2 text-xs [--cell:0.75rem]", className)}
      {...props}
    >
      <div ref={scroller} className="overflow-x-auto pb-1">
        <div
          role="group"
          aria-label={summary === false ? "Contributions" : undefined}
          className="grid w-max gap-[3px]"
          style={{
            gridTemplateColumns: `auto repeat(${weeks.length}, var(--cell))`,
            gridTemplateRows: "auto repeat(7, var(--cell))",
          }}
          onKeyDown={onKeyDown}
          onPointerLeave={() => setTip(null)}
        >
          {months.map((month) => (
            <span
              key={month.column}
              aria-hidden
              className="leading-none whitespace-nowrap text-muted-foreground"
              style={{ gridColumn: month.column + 2, gridRow: 1 }}
            >
              {month.label}
            </span>
          ))}
          {[1, 3, 5].map((row) => (
            <span
              key={row}
              aria-hidden
              className="pe-1.5 text-[0.625rem] leading-(--cell) text-muted-foreground"
              style={{ gridColumn: 1, gridRow: row + 2 }}
            >
              {weekdayFormat.format(addDays(new Date(2023, 0, 1), row + weekStart))}
            </span>
          ))}
          {weeks.map((week, column) =>
            week.map((day, row) => {
              if (!day) return null;
              index += 1;
              const i = index;
              const label = describe(day);
              return (
                <Cell
                  key={i}
                  {...(onDayClick ? { type: "button" as const } : { role: "img" })}
                  data-slot="contribution-graph-day"
                  data-level={day.level}
                  data-index={i}
                  aria-label={label}
                  tabIndex={i === focusIndex ? 0 : -1}
                  className={cn(
                    "size-(--cell) rounded-[3px] outline-offset-1 outline-ring focus-visible:outline-2",
                    // Five shades of the primary color, by data-level.
                    "bg-muted data-[level=1]:bg-primary/25 data-[level=2]:bg-primary/50 data-[level=3]:bg-primary/75 data-[level=4]:bg-primary",
                    onDayClick && "cursor-pointer",
                  )}
                  style={{ gridColumn: column + 2, gridRow: row + 2 }}
                  onPointerEnter={(event: React.PointerEvent<HTMLElement>) =>
                    showTip(i, event.currentTarget)
                  }
                  onFocus={(event: React.FocusEvent<HTMLElement>) => {
                    setActive(i);
                    showTip(i, event.currentTarget);
                  }}
                  onBlur={() => setTip(null)}
                  onClick={onDayClick ? () => onDayClick(day) : undefined}
                />
              );
            }),
          )}
        </div>
      </div>
      {(summary !== false || legend) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
          {summary !== false ? (
            <span data-slot="contribution-graph-summary">
              {summary
                ? summary(total)
                : `${total.toLocaleString(locale)} contribution${total === 1 ? "" : "s"}${startProp ? "" : " in the last year"}`}
            </span>
          ) : (
            <span />
          )}
          {legend && (
            <span
              data-slot="contribution-graph-legend"
              aria-hidden
              className="flex items-center gap-[3px]"
            >
              <span className="me-1">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  data-level={level}
                  className="size-3 rounded-[3px] bg-muted data-[level=1]:bg-primary/25 data-[level=2]:bg-primary/50 data-[level=3]:bg-primary/75 data-[level=4]:bg-primary"
                />
              ))}
              <span className="ms-1">More</span>
            </span>
          )}
        </div>
      )}
      {tip && (
        <div
          data-slot="contribution-graph-tooltip"
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background shadow-md"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}

export {
  ContributionGraph,
  type ContributionDay,
  type ContributionGraphDay,
  type ContributionGraphProps,
};
