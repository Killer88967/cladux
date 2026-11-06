"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import { type DateRange, type Matcher } from "react-day-picker";
import { useControllableState } from "../hooks/use-controllable-state";
import { Button } from "../button/button";
import { Calendar } from "../calendar/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

/** A named range, worked out when it's picked, so "Today" is always today. */
interface DateRangePreset {
  label: string;
  range: () => DateRange;
}

const day = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const sameDay = (a?: Date, b?: Date) => !!a && !!b && day(a).getTime() === day(b).getTime();

/** The presets DateRangePicker shows when you don't pass your own. */
const dateRangePresets: DateRangePreset[] = [
  { label: "Today", range: () => ({ from: day(new Date()), to: day(new Date()) }) },
  {
    label: "Yesterday",
    range: () => ({ from: addDays(new Date(), -1), to: addDays(new Date(), -1) }),
  },
  { label: "Last 7 days", range: () => ({ from: addDays(new Date(), -6), to: day(new Date()) }) },
  { label: "Last 30 days", range: () => ({ from: addDays(new Date(), -29), to: day(new Date()) }) },
  {
    label: "This month",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: day(now) };
    },
  },
  {
    label: "Last month",
    range: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    },
  },
  {
    label: "This year",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), 0, 1), to: day(now) };
    },
  },
];

interface DateRangePickerProps extends Omit<
  React.ComponentProps<typeof Button>,
  "value" | "defaultValue" | "onChange"
> {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  /** The ranges listed beside the calendar. Pass `[]` for none. */
  presets?: DateRangePreset[];
  /** Shown when nothing is picked. */
  placeholder?: string;
  /** How many months the calendar shows side by side. */
  numberOfMonths?: number;
  /** Days that can't be picked, in react-day-picker's matcher format, e.g. `{ after: new Date() }`. */
  disabledDates?: Matcher | Matcher[];
  /** The locale for the button's text, such as "en-GB". Defaults to the browser's. */
  locale?: string;
  /** Where the calendar opens. */
  align?: "start" | "center" | "end";
}

/**
 * A button that opens a calendar for picking a range of days, with presets
 * such as "Last 7 days" beside it. Picking a preset closes it; picking days
 * on the calendar keeps it open so you can adjust the range.
 */
function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  presets = dateRangePresets,
  placeholder = "Pick a date range",
  numberOfMonths = 2,
  disabledDates,
  locale,
  align = "start",
  className,
  disabled,
  ...props
}: DateRangePickerProps) {
  const [range, setRange] = useControllableState<DateRange | undefined>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => range?.from ?? new Date());

  const label = React.useMemo(() => {
    if (!range?.from) return null;
    const format = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    // formatRange writes "Jan 20 – Feb 9, 2026", sharing what both dates have in common.
    return range.to && !sameDay(range.from, range.to)
      ? format.formatRange(range.from, range.to)
      : format.format(range.from);
  }, [range, locale]);

  const active = presets.find((preset) => {
    const r = preset.range();
    return sameDay(r.from, range?.from) && sameDay(r.to, range?.to);
  });

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Opening shows the picked range, not wherever the calendar was left.
        if (next && range?.from) setMonth(range.from);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-slot="date-range-picker"
          data-empty={!label || undefined}
          disabled={disabled}
          className={cn("justify-start font-normal data-empty:text-muted-foreground", className)}
          {...props}
        >
          <CalendarIcon />
          {label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        data-slot="date-range-picker-content"
        className="flex w-auto max-w-(--radix-popover-content-available-width) flex-col p-0 sm:flex-row"
      >
        {presets.length > 0 && (
          <div
            data-slot="date-range-picker-presets"
            className="flex gap-1 overflow-x-auto border-b p-2 sm:w-36 sm:flex-col sm:overflow-visible sm:border-e sm:border-b-0"
          >
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={preset === active ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={preset === active}
                className="shrink-0 justify-start"
                onClick={() => {
                  const next = preset.range();
                  setRange(next);
                  if (next.from) setMonth(next.from);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={numberOfMonths}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}

export {
  DateRangePicker,
  dateRangePresets,
  type DateRange,
  type DateRangePickerProps,
  type DateRangePreset,
};
