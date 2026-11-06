"use client";

import { DateRangePicker, Field, FieldLabel, type DateRangePreset } from "@cladux/ui";

const inDays = (days: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
};

const trips: DateRangePreset[] = [
  { label: "This weekend", range: () => weekend(0) },
  { label: "Next weekend", range: () => weekend(7) },
  { label: "Next 7 days", range: () => ({ from: inDays(0), to: inDays(6) }) },
  { label: "Next 2 weeks", range: () => ({ from: inDays(0), to: inDays(13) }) },
];

/** Friday to Sunday of this week, or of a later one. */
function weekend(later: number) {
  const friday = inDays(((5 - new Date().getDay() + 7) % 7) + later);
  return {
    from: friday,
    to: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate() + 2),
  };
}

export default function DateRangePickerPresets() {
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="trip-dates">Trip dates</FieldLabel>
      <DateRangePicker
        id="trip-dates"
        presets={trips}
        placeholder="When are you going?"
        disabledDates={{ before: inDays(0) }}
      />
    </Field>
  );
}
