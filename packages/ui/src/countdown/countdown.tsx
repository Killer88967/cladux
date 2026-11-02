"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds left. */
  total: number;
  done: boolean;
}

function partsUntil(target: number, now: number): CountdownParts {
  const total = Math.max(0, target - now);
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
    done: total === 0,
  };
}

/**
 * Time left until `target`, updated every second. Returns null until it runs in
 * the browser, so server and client render the same thing.
 */
function useCountdown(target: Date | number | string, onComplete?: () => void) {
  const time = new Date(target).getTime();
  const [parts, setParts] = React.useState<CountdownParts | null>(null);
  const done = React.useRef(onComplete);
  done.current = onComplete;

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let fired = false;
    const tick = () => {
      const now = Date.now();
      const next = partsUntil(time, now);
      setParts(next);
      if (next.done) {
        if (!fired) done.current?.();
        fired = true;
        return;
      }
      // Line up with the next whole second.
      timer = setTimeout(tick, ((time - now) % 1000) + 10);
    };
    tick();
    return () => clearTimeout(timer);
  }, [time]);

  return parts;
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown({
  className,
  target,
  onComplete,
  labels = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  hideZeroDays = true,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  target: Date | number | string;
  onComplete?: () => void;
  labels?: { days: string; hours: string; minutes: string; seconds: string };
  /** Leave out the days box when there's less than a day to go. */
  hideZeroDays?: boolean;
  /** Shown instead of the boxes once the countdown ends. */
  children?: React.ReactNode;
}) {
  const parts = useCountdown(target, onComplete);

  if (parts?.done && children !== undefined) return <>{children}</>;

  const units = (["days", "hours", "minutes", "seconds"] as const).filter(
    (unit) => !(unit === "days" && hideZeroDays && parts && parts.days === 0),
  );

  return (
    <div
      data-slot="countdown"
      data-done={parts?.done || undefined}
      role="timer"
      className={cn("flex items-start gap-2", className)}
      {...props}
    >
      {units.map((unit) => (
        <div
          key={unit}
          data-slot="countdown-unit"
          aria-hidden
          className="flex min-w-14 flex-col items-center gap-1 rounded-lg bg-muted px-2 py-2"
        >
          <span
            data-slot="countdown-value"
            className="text-2xl font-semibold tracking-tight tabular-nums"
          >
            {parts ? pad(parts[unit]) : "--"}
          </span>
          <span data-slot="countdown-label" className="text-xs text-muted-foreground">
            {labels[unit]}
          </span>
        </div>
      ))}
      {/* One summary for screen readers instead of four numbers ticking every second. */}
      {/* Set in the browser only: a target computed from Date.now() differs between server and client. */}
      <time dateTime={parts ? new Date(target).toISOString() : undefined} className="sr-only">
        {parts
          ? `${parts.days} ${labels.days}, ${parts.hours} ${labels.hours}, ${parts.minutes} ${labels.minutes}`
          : ""}
      </time>
    </div>
  );
}

export { Countdown, useCountdown };
export type { CountdownParts };
