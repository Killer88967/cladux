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
export const KNOWN_STYLE_DIFFERENCES: Record<string, string> = {};
