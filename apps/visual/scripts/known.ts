/**
 * Demos whose screenshots change from run to run on their own, so comparisons
 * skip them. Keep this short: a demo here isn't checked at all.
 */
export const UNSTABLE = [
  // Scrolls to its starting position after it renders, on its own timing.
  "message-scroller-opening-position",
];

/**
 * Demos that look different in the Tailwind and plain CSS styles, and why.
 * `compare:styles` fails on any other difference. Remove an entry once it's
 * fixed; the compare script says when one matches again.
 * `node scripts/compare.ts styles --update` rewrites this list from a run.
 */
export const KNOWN_STYLE_DIFFERENCES: Record<string, string> = {
  "calendar-time":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "combobox-auto-highlight":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-basic":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-clear":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-custom":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-demo":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-disabled":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-groups":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-input-group":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "combobox-invalid":
    "Combobox: ComboboxInput's w-auto doesn't reach the plain CSS input group, so the input stretches to the full width.",
  "date-picker-basic":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-picker-dob":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-picker-input":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-picker-natural-language":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-picker-range":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-picker-time":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "date-range-picker-presets":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style. The input group is also 2px shorter.",
  "direction-rtl":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-checkbox":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-demo":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-fieldset":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-group":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-input":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-radio":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-responsive":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-select":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-switch":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "field-textarea":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "input-otp-pattern":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "image-compare-labels": "Differs by up to 0.6%. Not looked into yet.",
  "image-compare-vertical": "Differs by up to 0.5%. Not looked into yet.",
  "input-group-demo": "Input Group: the addons are a little taller in the plain CSS style.",
  "mention-input-async":
    "Mention Input: the text stays 16px in the plain CSS style instead of switching to 14px (md:text-sm) on wider screens.",
  "mention-input-demo":
    "Mention Input: the text stays 16px in the plain CSS style instead of switching to 14px (md:text-sm) on wider screens.",
  "pagination-icons-only": "Differs by up to 0.3%. Not looked into yet.",
  "progress-label":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "radio-group-description":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "radio-group-disabled":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "radio-group-fieldset":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "radio-group-invalid":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
  "rich-text-editor-controlled": "Differs by up to 0.3%. Not looked into yet.",
  "rich-text-editor-demo": "Differs by up to 0.4%. Not looked into yet.",
  "toggle-group-font-weight-selector":
    "Field: the gaps between a label and its control, and between fields, are smaller in the plain CSS style.",
};
