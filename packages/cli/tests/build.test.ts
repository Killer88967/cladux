import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { add } from "../src/commands/add.ts";
import { build } from "../src/commands/build.ts";
import { init } from "../src/commands/init.ts";
import { validateRegistry } from "../src/utils/validate.ts";
import { useProject } from "./helpers.ts";

const ctx = useProject();

/** Writes a file in the project, making its folder. */
async function put(file: string, content: string) {
  await mkdir(path.dirname(path.join(ctx.root, file)), { recursive: true });
  await writeFile(path.join(ctx.root, file), content);
}

const source = (items: unknown[], options: object = {}) =>
  put("cl-registry.json", JSON.stringify({ ...options, items }));
const readItem = async (name: string, style = "css") =>
  JSON.parse(await readFile(path.join(ctx.root, "public/r", style, `${name}.json`), "utf8"));

const STYLESHEET = path.join(import.meta.dirname, "fixtures/tailwind.css");

beforeEach(async () => {
  await init({
    cwd: ctx.root,
    yes: true,
    force: false,
    skipInstall: true,
    style: "css",
    registry: ctx.registry,
  });
  // A Cladux component the author's own components build on.
  await add({
    cwd: ctx.root,
    names: ["button"],
    yes: true,
    all: false,
    overwrite: false,
    skipInstall: true,
    dryRun: false,
    view: false,
    diff: false,
  });
  await put(
    "src/components/acme/fancy-card.tsx",
    [
      'import { Button } from "@/components/cl/button";',
      'import { cn } from "@/lib/cl-utils";',
      'import { Sparkle } from "./sparkle";',
      'import clsx from "clsx";',
      "export function FancyCard() {}",
      "",
    ].join("\n"),
  );
  await put("src/components/acme/sparkle.tsx", "export function Sparkle() {}\n");
});

describe("build", () => {
  it("finds the dependencies and points imports at the registry's aliases", async () => {
    await source([
      { name: "fancy-card", files: ["src/components/acme/fancy-card.tsx"] },
      { name: "sparkle", files: ["src/components/acme/sparkle.tsx"] },
    ]);
    await build({ cwd: ctx.root });

    const item = await readItem("fancy-card");
    expect(item.style).toBe("css");
    expect(item.dependencies).toEqual(["clsx@2.1.1"]);
    expect(item.registryDependencies).toEqual(["@cladux/button", "@cladux/utils", "sparkle"]);
    expect(item.files[0].content).toContain('from "@/components/cl/sparkle"');
    // The result passes the same checks as `registry validate`.
    expect((await validateRegistry(path.join(ctx.root, "public/r"))).issues).toEqual([]);
  });

  it("names imports that no item has", async () => {
    await source([{ name: "fancy-card", files: ["src/components/acme/fancy-card.tsx"] }]);
    await expect(build({ cwd: ctx.root })).rejects.toThrow(
      "imports ./sparkle, which isn't in any item. Add src/components/acme/sparkle.tsx",
    );
  });

  it("names packages that aren't in package.json", async () => {
    await put("src/components/acme/sparkle.tsx", 'import confetti from "canvas-confetti";\n');
    await source([{ name: "sparkle", files: ["src/components/acme/sparkle.tsx"] }]);
    await expect(build({ cwd: ctx.root })).rejects.toThrow(
      "imports canvas-confetti, which isn't in package.json",
    );
  });

  it("generates the css style from Tailwind files", async () => {
    await put(
      "src/components/acme/badge-x.tsx",
      'export function BadgeX() {\n  return <span className="inline-flex px-2 text-primary hover:underline" />;\n}\n',
    );
    await source([{ name: "badge-x", files: ["src/components/acme/badge-x.tsx"] }], {
      style: "tailwind",
      stylesheet: STYLESHEET,
    });
    await build({ cwd: ctx.root, tailwind: await import("@tailwindcss/node") });

    const css = await readItem("badge-x", "css");
    expect(css.files.map((f: { path: string }) => f.path)).toEqual(["badge-x.tsx", "badge-x.css"]);
    expect(css.files[0].content).toContain('className="cl-badge-x__span"');
    // Same names as Cladux's own css style: --primary becomes --cl-primary.
    expect(css.files[1].content).toContain("color: var(--cl-primary)");
    expect(css.files[1].content).toContain("--cl-spacing: .25rem");
    const index = JSON.parse(await readFile(path.join(ctx.root, "public/r/index.json"), "utf8"));
    expect(index.styles).toEqual(["tailwind", "css"]);
  });

  it('skips the css style with "css": false', async () => {
    await source([{ name: "sparkle", files: ["src/components/acme/sparkle.tsx"] }], {
      style: "tailwind",
      css: false,
    });
    await build({ cwd: ctx.root });
    expect(existsSync(path.join(ctx.root, "public/r/tailwind/sparkle.json"))).toBe(true);
    expect(existsSync(path.join(ctx.root, "public/r/css"))).toBe(false);
  });

  it("checks cl-registry.json first", async () => {
    await source([{ name: "Fancy Card", files: [] }]);
    await expect(build({ cwd: ctx.root })).rejects.toThrow("cl-registry.json has problems");
  });
});
