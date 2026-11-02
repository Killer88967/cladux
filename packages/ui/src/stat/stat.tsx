import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@cladux/utils";

/** A grid of stats that collapses to one column on small screens. */
function StatGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-group"
      className={cn("grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    />
  );
}

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat"
      className={cn(
        "group/stat relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10",
        className,
      )}
      {...props}
    />
  );
}

function StatHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-header"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-label"
      className={cn("truncate text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function StatIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-icon"
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-value"
      className={cn("text-2xl font-semibold tracking-tight tabular-nums", className)}
      {...props}
    />
  );
}

const statDeltaVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      trend: {
        up: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        down: "bg-destructive/10 text-destructive",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  },
);

/**
 * The change since the last period. `trend` picks the color and icon; set
 * `invert` when going down is good (costs, churn, response time).
 */
function StatDelta({
  className,
  trend = "neutral",
  invert = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statDeltaVariants> & {
    invert?: boolean;
  }) {
  const tone = invert && trend !== "neutral" ? (trend === "up" ? "down" : "up") : trend;
  const Icon = trend === "up" ? TrendingUpIcon : trend === "down" ? TrendingDownIcon : MinusIcon;
  return (
    <span
      data-slot="stat-delta"
      data-trend={trend}
      className={cn(statDeltaVariants({ trend: tone }), className)}
      {...props}
    >
      <Icon aria-hidden />
      {children}
      <span className="sr-only">
        {trend === "up" ? "(increase)" : trend === "down" ? "(decrease)" : "(no change)"}
      </span>
    </span>
  );
}

function StatDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-description"
      className={cn("flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * A small line chart drawn as SVG, no chart library needed. Its color is
 * `currentColor`, so set a text color on it.
 */
function StatSparkline({
  className,
  data,
  fill = true,
  strokeWidth = 1.5,
  ...props
}: Omit<React.ComponentProps<"svg">, "fill"> & {
  data: number[];
  /** Shade the area under the line. */
  fill?: boolean;
  strokeWidth?: number;
}) {
  const id = `stat-sparkline-${React.useId().replace(/[^\w-]/g, "")}`;
  if (data.length < 2) return null;
  const width = 100;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = strokeWidth;
  const points = data.map((value, i) => [
    (i / (data.length - 1)) * width,
    pad + (1 - (value - min) / range) * (height - pad * 2),
  ]);
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x!.toFixed(2)} ${y!.toFixed(2)}`)
    .join(" ");

  return (
    <svg
      data-slot="stat-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-8 w-full overflow-visible text-primary", className)}
      {...props}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export {
  Stat,
  StatDelta,
  statDeltaVariants,
  StatDescription,
  StatGroup,
  StatHeader,
  StatIcon,
  StatLabel,
  StatSparkline,
  StatValue,
};
