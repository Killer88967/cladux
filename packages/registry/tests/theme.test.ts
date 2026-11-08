import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  parseThemeCode,
  themeCode,
  themeCss,
  ThemeError,
  themeVars,
  type ThemeColors,
} from "../src/theme.ts";

const COLORS: ThemeColors = {
  bases: [
    {
      name: "neutral",
      title: "Neutral",
      light: { background: "white", primary: "black" },
      dark: { background: "black", primary: "white" },
    },
    {
      name: "zinc",
      title: "Zinc",
      light: { background: "white", primary: "gray" },
      dark: { background: "gray", primary: "white" },
    },
  ],
  accents: [
    {
      name: "violet",
      title: "Violet",
      light: { primary: "purple" },
      dark: { primary: "plum" },
    },
  ],
};

describe("theme codes", () => {
  it("writes the shortest code", () => {
    expect(themeCode(DEFAULT_THEME)).toBe("neutral");
    expect(themeCode({ base: "zinc", accent: "violet", radius: "default" })).toBe("zinc-violet");
    expect(themeCode({ base: "zinc", radius: "lg" })).toBe("zinc-lg");
    expect(themeCode({ base: "zinc", accent: "violet", radius: "none" })).toBe("zinc-violet-none");
  });

  it("reads back every code it writes", () => {
    for (const accent of [undefined, "violet"]) {
      for (const radius of ["none", "sm", "md", "default", "lg", "xl"] as const) {
        const theme = { base: "zinc", ...(accent ? { accent } : {}), radius };
        expect(parseThemeCode(themeCode(theme), COLORS)).toEqual(theme);
      }
    }
  });

  it("ignores case and spaces around the code", () => {
    expect(parseThemeCode("  Zinc-VIOLET ", COLORS)).toEqual({
      base: "zinc",
      accent: "violet",
      radius: "default",
    });
  });

  it("says which bases there are when the base is wrong", () => {
    expect(() => parseThemeCode("red", COLORS)).toThrow(
      '"red" isn\'t a base color. A theme code starts with one of: neutral, zinc.',
    );
  });

  it("says what a part should be when it isn't an accent or a radius", () => {
    expect(() => parseThemeCode("zinc-teal", COLORS)).toThrow(ThemeError);
    expect(() => parseThemeCode("zinc-teal", COLORS)).toThrow(
      /Accents: violet\. Radius: none, sm, md, default, lg, xl\./,
    );
  });

  it("only takes an accent before the radius, and one of each", () => {
    expect(() => parseThemeCode("zinc-lg-violet", COLORS)).toThrow(ThemeError);
    expect(() => parseThemeCode("zinc-violet-violet", COLORS)).toThrow(ThemeError);
    expect(() => parseThemeCode("zinc-lg-sm", COLORS)).toThrow(ThemeError);
  });
});

describe("themeVars", () => {
  it("lays the accent over the base", () => {
    expect(themeVars({ base: "zinc", accent: "violet", radius: "lg" }, COLORS)).toEqual({
      radius: "0.75rem",
      light: { background: "white", primary: "purple" },
      dark: { background: "gray", primary: "plum" },
    });
  });

  it("throws for colors that don't exist", () => {
    expect(() => themeVars({ base: "red", radius: "default" }, COLORS)).toThrow(ThemeError);
    expect(() => themeVars({ base: "zinc", accent: "teal", radius: "default" }, COLORS)).toThrow(
      ThemeError,
    );
  });
});

describe("themeCss", () => {
  const theme = { base: "zinc", accent: "violet", radius: "sm" } as const;

  it("uses shadcn's names for the Tailwind style", () => {
    const css = themeCss(theme, COLORS, "tailwind");
    expect(css).toContain(
      ":root {\n  --radius: 0.3rem;\n  --background: white;\n  --primary: purple;",
    );
    expect(css).toContain(
      '.dark,\n[data-theme="dark"] {\n  --background: gray;\n  --primary: plum;',
    );
  });

  it("adds the cl- prefix for the CSS style", () => {
    const css = themeCss(theme, COLORS, "css");
    expect(css).toContain("--cl-radius: 0.3rem;");
    expect(css).toContain("--cl-primary: purple;");
    expect(css).not.toMatch(/--(?!cl-)[a-z]+:/);
  });
});
