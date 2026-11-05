/** A theme code that doesn't read. The message says what's wrong. */
export class ThemeError extends Error {}

export type ThemeVars = Record<string, string>;

/** A set of colors: a base sets every variable, an accent overrides some of them. */
export interface ThemePreset {
  name: string;
  title: string;
  light: ThemeVars;
  dark: ThemeVars;
}

/** The colors a theme is made from, as a registry publishes them in themes.json. */
export interface ThemeColors {
  bases: ThemePreset[];
  accents: ThemePreset[];
}

/** The radius sizes, by the word a theme code uses for them. */
export const RADII = {
  none: "0",
  sm: "0.3rem",
  md: "0.5rem",
  default: "0.625rem",
  lg: "0.75rem",
  xl: "1rem",
} as const;

export type Radius = keyof typeof RADII;

/** A theme: a base color, an optional accent, and a radius. */
export interface Theme {
  base: string;
  accent?: string;
  radius: Radius;
}

export const DEFAULT_THEME: Theme = { base: "neutral", radius: "default" };

/** A theme's short code: "zinc", "zinc-violet", "stone-rose-lg". */
export const themeCode = ({ base, accent, radius }: Theme) =>
  [base, accent, radius === "default" ? undefined : radius].filter(Boolean).join("-");

const names = (presets: ThemePreset[]) => presets.map((p) => p.name).join(", ");

/** Reads a theme code back. Throws a ThemeError that says what's wrong. */
export function parseThemeCode(code: string, colors: ThemeColors): Theme {
  const [base = "", ...rest] = code.trim().toLowerCase().split("-");
  if (!colors.bases.some((p) => p.name === base)) {
    throw new ThemeError(
      `"${base}" isn't a base color. A theme code starts with one of: ${names(colors.bases)}.`,
    );
  }
  const theme: Theme = { base, radius: "default" };
  for (const part of rest) {
    if (!theme.accent && theme.radius === "default" && colors.accents.some((p) => p.name === part))
      theme.accent = part;
    else if (theme.radius === "default" && Object.hasOwn(RADII, part))
      theme.radius = part as Radius;
    else
      throw new ThemeError(
        `"${part}" in "${code}" isn't an accent or a radius. Accents: ${names(colors.accents)}. Radius: ${Object.keys(RADII).join(", ")}.`,
      );
  }
  return theme;
}

/** The variables a theme sets, in light and dark. */
export function themeVars(theme: Theme, colors: ThemeColors) {
  const base = colors.bases.find((p) => p.name === theme.base);
  if (!base) throw new ThemeError(`"${theme.base}" isn't a base color.`);
  const accent = theme.accent ? colors.accents.find((p) => p.name === theme.accent) : undefined;
  if (theme.accent && !accent) throw new ThemeError(`"${theme.accent}" isn't an accent.`);
  return {
    radius: RADII[theme.radius],
    light: { ...base.light, ...accent?.light },
    dark: { ...base.dark, ...accent?.dark },
  };
}

function block(selector: string, vars: ThemeVars, prefix: string, first?: string) {
  const lines = Object.entries(vars).map(([key, value]) => `  --${prefix}${key}: ${value};`);
  if (first) lines.unshift(first);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/**
 * A theme as CSS, the way cl-tokens.css is written: shadcn's variable names for
 * the Tailwind style, the same names with a `cl-` prefix for the CSS style.
 */
export function themeCss(theme: Theme, colors: ThemeColors, style: "tailwind" | "css") {
  const { radius, light, dark } = themeVars(theme, colors);
  const prefix = style === "css" ? "cl-" : "";
  return `${[
    block(":root", light, prefix, `  --${prefix}radius: ${radius};`),
    block('.dark,\n[data-theme="dark"]', dark, prefix),
  ].join("\n\n")}\n`;
}
