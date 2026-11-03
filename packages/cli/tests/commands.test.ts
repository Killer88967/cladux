import { existsSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { add, type AddOptions } from "../src/commands/add.ts";
import { diff } from "../src/commands/diff.ts";
import { docs } from "../src/commands/docs.ts";
import { init } from "../src/commands/init.ts";
import { update, type UpdateOptions } from "../src/commands/update.ts";
import { changeUpstream, read, useProject } from "./helpers.ts";

const ctx = useProject();

const runAdd = (names: string[], opts: Partial<AddOptions> = {}) =>
  add({
    cwd: ctx.root,
    names,
    yes: true,
    all: false,
    overwrite: false,
    skipInstall: true,
    dryRun: false,
    view: false,
    diff: false,
    ...opts,
  });

const runUpdate = (names: string[], opts: Partial<UpdateOptions> = {}) =>
  update({ cwd: ctx.root, names, force: false, dryRun: false, skipInstall: true, ...opts });

beforeEach(() =>
  init({
    cwd: ctx.root,
    yes: true,
    force: false,
    skipInstall: true,
    style: "css",
    registry: ctx.registry,
  }),
);

describe("init", () => {
  it("writes cl.json, the helper and the lock", async () => {
    const config = JSON.parse(await read(ctx.root, "cl.json"));
    expect(config.style).toBe("css");
    expect(existsSync(path.join(ctx.root, "src/lib/cl-utils.ts"))).toBe(true);
    const lock = JSON.parse(await read(ctx.root, "cl-lock.json"));
    expect(Object.keys(lock.files)).toContain("src/lib/cl-utils.ts");
  });
});

describe("add", () => {
  it("adds a component, its dependencies and its CSS", async () => {
    await runAdd(["card"]);
    expect(await read(ctx.root, "src/components/cl/card.tsx")).toContain(
      'from "@/components/cl/button"',
    );
    expect(existsSync(path.join(ctx.root, "src/components/cl/button.tsx"))).toBe(true);
    expect(await read(ctx.root, "src/styles/cl.css")).toContain('@import "./button.css";');
  });

  it("puts blocks in their own folder", async () => {
    await runAdd(["hero-01"]);
    expect(existsSync(path.join(ctx.root, "src/components/cl/blocks/hero-01.tsx"))).toBe(true);
  });

  it("puts what you named in --path, and its dependencies where they always go", async () => {
    await runAdd(["card"], { path: "src/ui" });
    expect(existsSync(path.join(ctx.root, "src/ui/card.tsx"))).toBe(true);
    expect(existsSync(path.join(ctx.root, "src/components/cl/button.tsx"))).toBe(true);
  });

  it("writes nothing with --dry-run, --view or --diff", async () => {
    await runAdd(["card"], { dryRun: true });
    await runAdd(["card"], { view: true });
    await runAdd(["card"], { diff: true });
    expect(existsSync(path.join(ctx.root, "src/components"))).toBe(false);
  });

  it("names unknown components and suggests close ones", async () => {
    await expect(runAdd(["buton"])).rejects.toThrow('"buton" (did you mean button?)');
  });
});

describe("update", () => {
  beforeEach(() => runAdd(["card"]));

  it("replaces files you haven't changed", async () => {
    await changeUpstream(ctx.registry, "button", "export function Button() { /* v2 */ }\n");
    await runUpdate([]);
    expect(await read(ctx.root, "src/components/cl/button.tsx")).toContain("v2");
  });

  it("keeps files you changed, unless --force", async () => {
    const card = path.join(ctx.root, "src/components/cl/card.tsx");
    await writeFile(card, "export function Card() { /* mine */ }\n");
    await changeUpstream(ctx.registry, "card", "export function Card() { /* v2 */ }\n");

    await runUpdate(["card"]);
    expect(await read(ctx.root, "src/components/cl/card.tsx")).toContain("mine");

    await runUpdate(["card"], { force: true });
    expect(await read(ctx.root, "src/components/cl/card.tsx")).toContain("v2");
  });

  it("writes nothing with --dry-run", async () => {
    await changeUpstream(ctx.registry, "button", "export function Button() { /* v2 */ }\n");
    await runUpdate([], { dryRun: true });
    expect(await read(ctx.root, "src/components/cl/button.tsx")).not.toContain("v2");
  });
});

describe("diff", () => {
  it("lists the installed items that differ from the registry", async () => {
    await runAdd(["card"]);
    await changeUpstream(ctx.registry, "button", "export function Button() { /* v2 */ }\n");
    await diff({ cwd: ctx.root, names: [] });
    const output = vi.mocked(console.log).mock.calls.flat().join("\n");
    expect(output).toContain("button (1 file)");
    expect(output).not.toContain("card (");
  });
});

describe("docs", () => {
  it("prints the page, importing from your components folder", async () => {
    await docs({ cwd: ctx.root, names: ["button"] });
    const output = vi.mocked(console.log).mock.calls.flat().join("\n");
    expect(output).toContain('import { Button } from "@/components/cl/button";');
  });

  it("says when there's no page", async () => {
    await expect(docs({ cwd: ctx.root, names: ["card"] })).rejects.toThrow('No docs for "card"');
  });
});

it("leaves no stray files in the project root", async () => {
  await runAdd(["card"]);
  expect(readdirSync(ctx.root).sort()).toEqual([
    "cl-lock.json",
    "cl.json",
    "package.json",
    "src",
    "tsconfig.json",
  ]);
});
