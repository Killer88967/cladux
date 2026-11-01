// Based on shadcn/ui (MIT), "nova" style - https://ui.shadcn.com/docs/components/skeleton
import type * as React from "react";
import { cn } from "@cladux/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
