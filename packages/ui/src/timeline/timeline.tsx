import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@cladux/utils";

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      className={cn("group/timeline flex w-full flex-col text-sm", className)}
      {...props}
    />
  );
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn(
        "group/timeline-item relative grid grid-cols-[auto_1fr] gap-x-3 pb-6 not-last:before:absolute not-last:before:start-[calc(--spacing(1.5)-0.5px)] not-last:before:top-6 not-last:before:bottom-1 not-last:before:w-px not-last:before:bg-border last:pb-0 has-data-[size=icon]:not-last:before:start-[calc(--spacing(3)-0.5px)] has-data-[size=icon]:not-last:before:top-8",
        className,
      )}
      {...props}
    />
  );
}

const timelineDotVariants = cva(
  "relative z-10 col-start-1 row-span-full flex shrink-0 items-center justify-center rounded-full [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-2 border-border bg-background",
        primary: "bg-primary text-primary-foreground",
        muted: "bg-muted text-muted-foreground",
        success: "bg-emerald-600 text-white dark:bg-emerald-500",
        warning: "bg-amber-500 text-white",
        destructive: "bg-destructive text-white",
      },
      size: {
        default: "mt-1.5 size-3 [&_svg]:hidden",
        icon: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * The marker on the line. Plain by default; pass an icon as children and
 * `size="icon"` for a larger marker.
 */
function TimelineDot({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof timelineDotVariants>) {
  return (
    <span
      data-slot="timeline-dot"
      data-variant={variant}
      data-size={size}
      aria-hidden
      className={cn(timelineDotVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn(
        "col-start-2 flex min-w-0 flex-col gap-1 group-has-data-[size=icon]/timeline-item:pt-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn("flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5", className)}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="timeline-title" className={cn("font-medium", className)} {...props} />;
}

function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  timelineDotVariants,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
};
