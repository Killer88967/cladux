"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

/** "3 minutes ago", "in 2 days", "yesterday". */
function formatRelativeTime(
  date: Date | number | string,
  {
    now = Date.now(),
    locale,
    numeric = "auto",
    style = "long",
  }: {
    now?: number;
    locale?: string;
    numeric?: Intl.RelativeTimeFormatNumeric;
    style?: Intl.RelativeTimeFormatStyle;
  } = {},
) {
  const seconds = (new Date(date).getTime() - now) / 1000;
  const format = new Intl.RelativeTimeFormat(locale, { numeric, style });
  if (Math.abs(seconds) < 45) return format.format(0, "second");
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") {
      return format.format(Math.round(seconds / size), unit);
    }
  }
  return format.format(0, "second");
}

/** How long until the text could change, so updates aren't wasted. */
function nextUpdate(seconds: number) {
  const abs = Math.abs(seconds);
  if (abs < 60) return 5_000;
  if (abs < 60 * 60) return 30_000;
  if (abs < 24 * 60 * 60) return 5 * 60_000;
  return 60 * 60_000;
}

function RelativeTime({
  date,
  locale,
  numeric = "auto",
  style: formatStyle = "long",
  className,
  title,
  children,
  ...props
}: Omit<React.ComponentProps<"time">, "dateTime" | "children" | "style"> & {
  date: Date | number | string;
  locale?: string;
  numeric?: Intl.RelativeTimeFormatNumeric;
  style?: Intl.RelativeTimeFormatStyle;
  /** Shown before the page hydrates, since the server can't know the viewer's clock. */
  children?: React.ReactNode;
}) {
  const time = new Date(date).getTime();
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      timer = setTimeout(tick, nextUpdate((time - current) / 1000));
    };
    tick();
    // Catch up straight away when the tab comes back.
    const onVisible = () => document.visibilityState === "visible" && (clearTimeout(timer), tick());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [time]);

  const iso = Number.isNaN(time) ? undefined : new Date(time).toISOString();
  const full =
    now === null || iso === undefined
      ? undefined
      : new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(time);

  return (
    <time
      data-slot="relative-time"
      dateTime={iso}
      title={title ?? full}
      className={cn("tabular-nums", className)}
      {...props}
    >
      {now === null
        ? (children ?? iso?.slice(0, 10))
        : formatRelativeTime(time, { now, locale, numeric, style: formatStyle })}
    </time>
  );
}

export { formatRelativeTime, RelativeTime };
