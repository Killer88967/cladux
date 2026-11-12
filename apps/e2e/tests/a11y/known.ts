/**
 * Problems axe finds that we know about and haven't fixed yet, each with why.
 * Anything not on this list fails the check. When one gets fixed, remove it here.
 */
export interface Known {
  rule: string;
  reason: string;
  /** Only on pages whose path matches. */
  page?: RegExp;
  /** Only elements whose HTML matches. */
  html?: RegExp;
  /** For color-contrast: the text and background colors, as axe reports them. */
  colors?: [foreground: string, background: string][];
}

export const KNOWN: Known[] = [
  {
    rule: "color-contrast",
    reason:
      "shadcn's nova look in dark mode: destructive buttons, badges and alerts use red text on a dark red tint (about 4:1). A red light enough for 4.5:1 reads as pink, so dark mode keeps shadcn's red; light mode's is darker and passes.",
    colors: [
      ["#ff6467", "#4c2d2d"],
      ["#d35456", "#231313"],
      ["#d15457", "#171717"],
    ],
  },
  {
    rule: "color-contrast",
    reason: "The shimmer on a running trace step animates its text color, which axe can't measure.",
    html: /data-slot="trace-title"/,
  },
  {
    rule: "color-contrast",
    reason: "The spinner demo's placeholder addon is faded on purpose while it's busy.",
    page: /^\/docs\/components\/spinner$/,
  },
  {
    rule: "color-contrast",
    reason: "The Code Block demo dims collapsed lines with half-opacity theme colors.",
    page: /^\/docs\/components\/code-block$/,
  },
  {
    rule: "aria-valid-attr-value",
    reason:
      "Demos that use Tabs as a switcher, with no panel behind each tab (from shadcn's examples). Their aria-controls point at panels that don't exist.",
    html: /role="tab"/,
    page: /^\/(docs\/components\/(tabs|collapsible|message-scroller)|examples\/mail)$/,
  },
  {
    rule: "aria-required-children",
    reason: "cmdk puts separators inside its listbox, which ARIA doesn't allow there.",
    page: /^\/docs\/components\/command$/,
  },
  {
    rule: "label-content-name-mismatch",
    reason:
      "The custom days demo adds a price under each day, so the visible text is longer than the date label.",
    page: /^\/docs\/components\/calendar$/,
  },
];

/** True when a violation on this page and element is on the known list. */
export function isKnown(
  rule: string,
  page: string,
  node: { html: string; any: { data?: unknown }[] },
) {
  return KNOWN.some((k) => {
    if (k.rule !== rule) return false;
    if (k.page && !k.page.test(page)) return false;
    if (k.html && !k.html.test(node.html)) return false;
    if (k.colors) {
      const data = node.any.find((c) => c.data)?.data as
        { fgColor?: string; bgColor?: string } | undefined;
      return k.colors.some(
        ([fg, bg]) => data?.fgColor?.toLowerCase() === fg && data?.bgColor?.toLowerCase() === bg,
      );
    }
    return true;
  });
}
