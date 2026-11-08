import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { packageName, validateRegistry } from "../src/validate.ts";
import { removeRegistry, writeRegistry } from "./helpers.ts";

let dir = "";
beforeEach(async () => {
  dir = await writeRegistry();
});
afterEach(() => removeRegistry(dir));

async function change(file: string, edit: (json: any) => void) {
  const json = JSON.parse(await readFile(path.join(dir, file), "utf8"));
  edit(json);
  await writeFile(path.join(dir, file), JSON.stringify(json));
}

const messages = async () => (await validateRegistry(dir)).issues.map((i) => i.message);

describe("validateRegistry", () => {
  it("passes a valid registry and counts every file", async () => {
    expect(await validateRegistry(dir)).toEqual({ issues: [], checked: 8 });
  });

  it("needs an index.json", async () => {
    await rm(path.join(dir, "index.json"));
    expect(await messages()).toEqual(["Not found. A registry needs an index.json at its root."]);
  });

  it("finds a missing item file", async () => {
    await rm(path.join(dir, "css", "card.json"));
    expect(await messages()).toContain(
      "Missing. index.json lists card, so every style needs this file.",
    );
  });

  it("finds an item in the wrong style folder", async () => {
    await change("css/button.json", (item) => {
      item.style = "tailwind";
    });
    expect(await messages()).toContain('style is "tailwind", but it\'s in css/');
  });

  it("warns about imports add wouldn't install", async () => {
    await change("css/button.json", (item) => {
      item.files[0].content += 'import { motion } from "motion/react";\nimport x from "./x";\n';
    });
    const found = await messages();
    expect(found).toContain("button.tsx: imports motion, which isn't in dependencies");
    expect(found).toContain(
      "button.tsx: imports ./x: relative imports break once files are installed",
    );
  });

  it("finds two items writing the same file", async () => {
    await change("css/card.json", (item) => {
      item.files[0].path = "button.tsx";
    });
    expect(await messages()).toContain("button.tsx is also written by button");
  });

  it("warns about item files index.json doesn't list", async () => {
    await writeFile(path.join(dir, "css", "stray.json"), "{}");
    expect(await messages()).toContain("Not listed in index.json, so `add` can't find it");
  });

  // The registry the site builds, when it's there (after `pnpm build`).
  const site = path.resolve(import.meta.dirname, "../../../apps/www/public/r");
  it.skipIf(!existsSync(path.join(site, "index.json")))(
    "passes the site's own registry",
    async () => {
      const { issues, checked } = await validateRegistry(site);
      expect(issues.filter((i) => i.level === "error")).toEqual([]);
      expect(checked).toBeGreaterThan(100);
    },
  );
});

describe("packageName", () => {
  it("strips versions and subpaths", () => {
    expect(packageName("clsx@^2")).toBe("clsx");
    expect(packageName("@base-ui/react/menu")).toBe("@base-ui/react");
    expect(packageName("@scope/pkg@1.0.0")).toBe("@scope/pkg");
    expect(packageName("radix-ui/react-slot")).toBe("radix-ui");
  });
});
