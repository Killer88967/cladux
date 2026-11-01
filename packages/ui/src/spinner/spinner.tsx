// Based on shadcn/ui (MIT), "nova" style - https://ui.shadcn.com/docs/components/spinner
import type * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@cladux/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
