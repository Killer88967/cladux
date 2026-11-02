"use client";

import { StarIcon } from "lucide-react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

const ratingVariants = cva(
  "group/rating inline-flex items-center text-amber-400 outline-none data-disabled:pointer-events-none data-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "gap-0.5 [&_svg]:size-5",
        sm: "gap-0.5 [&_svg]:size-4",
        lg: "gap-1 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface RatingProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">,
    VariantProps<typeof ratingVariants> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  /** Allow half steps. */
  allowHalf?: boolean;
  /** Show the value without letting it change. Fractions are drawn exactly. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Replace the star. Receives no props; size and color come from the root. */
  icon?: React.ReactNode;
  /** Names each option for screen readers. */
  getLabel?: (value: number, max: number) => string;
}

function Rating({
  className,
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  allowHalf = false,
  readOnly = false,
  disabled = false,
  size = "default",
  icon = <StarIcon />,
  getLabel = (v, m) => `${v} out of ${m} stars`,
  "aria-label": ariaLabel = "Rating",
  ...props
}: RatingProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [hover, setHover] = React.useState<number | null>(null);
  const step = allowHalf ? 0.5 : 1;
  const shown = hover ?? current;
  const interactive = !readOnly && !disabled;

  const valueAt = (index: number, e: React.MouseEvent<HTMLElement>) => {
    if (!allowHalf) return index + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const x = rtl ? rect.right - e.clientX : e.clientX - rect.left;
    return index + (x < rect.width / 2 ? 0.5 : 1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const keys: Record<string, number> = {
      [forward]: current + step,
      ArrowUp: current + step,
      [back]: current - step,
      ArrowDown: current - step,
      Home: 0,
      End: max,
    };
    if (e.key in keys) {
      e.preventDefault();
      setCurrent(Math.min(max, Math.max(0, keys[e.key]!)));
    } else if (/^\d$/.test(e.key) && Number(e.key) <= max) {
      setCurrent(Number(e.key));
    }
  };

  return (
    <div
      data-slot="rating"
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      role={interactive ? "slider" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel : `${ariaLabel}: ${getLabel(current, max)}`}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? max : undefined}
      aria-valuenow={interactive ? current : undefined}
      aria-valuetext={interactive ? getLabel(current, max) : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      onPointerLeave={() => setHover(null)}
      className={cn(
        ratingVariants({ size }),
        interactive &&
          "rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 [&_[data-slot=rating-item]]:cursor-pointer",
        className,
      )}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        // How much of this star is filled, 0 to 1.
        const fill = Math.min(1, Math.max(0, shown - index));
        return (
          <span
            key={index}
            data-slot="rating-item"
            data-state={fill === 1 ? "full" : fill === 0 ? "empty" : "partial"}
            onPointerMove={interactive ? (e) => setHover(valueAt(index, e)) : undefined}
            onClick={
              interactive
                ? (e) => {
                    const next = valueAt(index, e);
                    // Clicking the current value clears it.
                    setCurrent(next === current ? 0 : next);
                  }
                : undefined
            }
            className="relative inline-flex shrink-0 transition-transform group-data-readonly/rating:transition-none"
          >
            <span className="flex text-muted-foreground/30 [&_svg]:fill-current">{icon}</span>
            <span
              aria-hidden
              className="absolute inset-y-0 start-0 flex overflow-hidden [&_svg]:max-w-none [&_svg]:shrink-0 [&_svg]:fill-current"
              style={{ width: `${fill * 100}%` }}
            >
              {icon}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export { Rating, ratingVariants };
export type { RatingProps };
