import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readConfig } from "../src/utils/config.ts";
import { configIssues } from "../src/utils/schema.ts";
import { validateRegistry } from "../src/utils/validate.ts";
import { writeRegistry } from "./helpers.ts";

let dir = "";
beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "cladux-validate-"));
  await writeRegistry(dir);
});
afterEach(() => rm(dir, { recursive: true, force: true }));

/** Changes one JSON file of the test registry. */
async function change(file: string, edit: (json: any) => void) {
  const json = JSON.parse(await readFile(path.join(dir, file), "utf8"));
  edit(json);
  await writeFile(path.join(dir, file), JSON.stringify(json));
}

const messages = async () => (await validateRegistry(dir)).issues.map((i) => i.message);

describe("validateRegistry", () => {
  it("passes a valid registry", async () => {
    const { issues, checked } = await validateRegistry(dir);
    expect(issues).toEqual([]);
    expect(checked).toBe(5);
  });

  it("finds unknown and circular dependencies", async () => {
    await change("index.json", (index) => {
      index.items.find((i: any) => i.name === "card").registryDependencies.push("nope");
      index.items.find((i: any) => i.name === "button").registryDependencies.push("card");
    });
    const found = await messages();
    expect(found).toContain('card needs "nope", which isn\'t in the registry');
    expect(found.some((m) => m.startsWith("Circular dependency:"))).toBe(true);
  });

  it("explains schema problems", async () => {
    await change("css/card.json", (item) => {
      item.files[0].path = "../card.tsx";
    });
    expect(await messages()).toContain(
      "files[0].path must be a path inside its folder, without a leading / or ..",
    );
  });

  it("warns about imports add wouldn't install", async () => {
    await change("css/card.json", (item) => {
      item.files[0].content += 'import { motion } from "motion/react";\n';
    });
    expect(await messages()).toContain("card.tsx: imports motion, which isn't in dependencies");
  });

  it("says when index.json is missing", async () => {
    await rm(path.join(dir, "index.json"));
    expect(await messages()).toEqual(["Not found. A registry needs an index.json at its root."]);
  });
});

describe("cl.json", () => {
  const valid = {
    style: "css",
    tsx: true,
    framework: "next",
    registry: "https://cladux.vercel.app/r",
    css: {
      globals: "src/app/globals.css",
      dir: "src/styles",
      entry: "src/styles/cl.css",
      tokens: true,
    },
    aliases: {
      components: "@/components/cl",
      hooks: "@/hooks",
      lib: "@/lib",
      utils: "@/lib/cl-utils",
    },
  };

  it("accepts a valid config", () => {
    expect(configIssues(valid)).toEqual([]);
  });

  it("names what's wrong", () => {
    expect(configIssues({ ...valid, style: "sass", extra: 1 })).toEqual([
      'style must be one of "tailwind", "css"',
      '"extra" isn\'t a known field',
    ]);
  });

  it("stops commands before they get far", async () => {
    await writeFile(path.join(dir, "cl.json"), JSON.stringify({ ...valid, style: "sass" }));
    await expect(readConfig(dir)).rejects.toThrow("cl.json has problems");
  });
});
