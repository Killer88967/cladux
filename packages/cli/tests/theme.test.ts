import { parseThemeCode, themeCode, themeCss } from "cladux-registry";
import { beforeEach, describe, expect, it } from "vitest";
import { apply } from "../src/commands/apply.ts";
import { init, type InitOptions } from "../src/commands/init.ts";
import { read, THEMES, useProject } from "./helpers.ts";

const ctx = useProject();

const runInit = (opts: Partial<InitOptions> = {}) =>
  init({
    cwd: ctx.root,
    yes: true,
    force: false,
    skipInstall: true,
    style: "css",
    registry: ctx.registry,
    ...opts,
  });

describe("theme codes", () => {
  it("read back the theme they were made from", () => {
    for (const code of ["neutral", "zinc", "zinc-blue", "zinc-lg", "neutral-blue-none"]) {
      expect(themeCode(parseThemeCode(code, THEMES))).toBe(code);
    }
    expect(parseThemeCode(" Zinc-Blue ", THEMES)).toEqual({
      base: "zinc",
      accent: "blue",
      radius: "default",
    });
  });

  it("say what's wrong with a code", () => {
    expect(() => parseThemeCode("zinx", THEMES)).toThrow('"zinx" isn\'t a base color');
    expect(() => parseThemeCode("zinc-red", THEMES)).toThrow(
      '"red" in "zinc-red" isn\'t an accent or a radius',
    );
    // The accent comes before the radius, and each one only once.
    expect(() => parseThemeCode("zinc-lg-blue", THEMES)).toThrow('"blue"');
    expect(() => parseThemeCode("zinc-lg-xl", THEMES)).toThrow('"xl"');
  });

  it("are written as cl-tokens.css, in either style", () => {
    const theme = parseThemeCode("zinc-blue-lg", THEMES);
    expect(themeCss(theme, THEMES, "tailwind")).toBe(
      [
        ":root {",
        "  --radius: 0.75rem;",
        "  --background: white;",
        "  --primary: blue;",
        "}",
        "",
        ".dark,",
        '[data-theme="dark"] {',
        "  --background: gray;",
        "  --primary: lightblue;",
        "}",
        "",
      ].join("\n"),
    );
    expect(themeCss(theme, THEMES, "css")).toContain("  --cl-primary: blue;");
  });
});

describe("apply", () => {
  beforeEach(() => runInit());

  it("rewrites cl-tokens.css and saves the code in cl.json", async () => {
    await apply({ cwd: ctx.root, code: "Zinc-Blue" });
    const tokens = await read(ctx.root, "src/styles/cl-tokens.css");
    expect(tokens).toContain("--cl-primary: blue;");
    expect(tokens).toContain("--cl-radius: 0.625rem;");
    expect(JSON.parse(await read(ctx.root, "cl.json")).theme).toBe("zinc-blue");
  });

  it("refuses a code it can't read, and changes nothing", async () => {
    const before = await read(ctx.root, "src/styles/cl-tokens.css");
    await expect(apply({ cwd: ctx.root, code: "zinc-purple" })).rejects.toThrow(
      "isn't an accent or a radius",
    );
    expect(await read(ctx.root, "src/styles/cl-tokens.css")).toBe(before);
    expect(JSON.parse(await read(ctx.root, "cl.json")).theme).toBeUndefined();
  });

  it("asks for a code", async () => {
    await expect(apply({ cwd: ctx.root })).rejects.toThrow("Which theme?");
  });
});

describe("init --theme", () => {
  it("writes the theme instead of the default one", async () => {
    await runInit({ theme: "zinc-xl" });
    expect(await read(ctx.root, "src/styles/cl-tokens.css")).toContain("--cl-radius: 1rem;");
    expect(JSON.parse(await read(ctx.root, "cl.json")).theme).toBe("zinc-xl");
  });

  it("keeps the applied theme when you set up again", async () => {
    await runInit();
    await apply({ cwd: ctx.root, code: "zinc-blue" });
    await runInit({ force: true });
    expect(await read(ctx.root, "src/styles/cl-tokens.css")).toContain("--cl-primary: blue;");
    expect(JSON.parse(await read(ctx.root, "cl.json")).theme).toBe("zinc-blue");
  });
});
