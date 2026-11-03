import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REGISTRY_ALIASES, type Config } from "../src/utils/config.ts";
import { addImport } from "../src/utils/css.ts";
import { rewriteImports } from "../src/utils/files.ts";
import { fingerprint, recordFiles } from "../src/utils/lock.ts";

const config = {
  aliases: { ...REGISTRY_ALIASES, components: "~/ui", utils: "~/lib/utils", lib: "~/lib" },
} as Config;

describe("rewriteImports", () => {
  it("swaps the registry aliases for the project's", () => {
    const code =
      'import { cn } from "@/lib/cl-utils";\nimport { Button } from "@/components/cl/button";';
    expect(rewriteImports(code, config)).toBe(
      'import { cn } from "~/lib/utils";\nimport { Button } from "~/ui/button";',
    );
  });

  it("leaves other @/ imports alone", () => {
    expect(rewriteImports('import x from "@/app/x";', config)).toBe('import x from "@/app/x";');
  });
});

describe("addImport", () => {
  it("goes after the last @import", () => {
    expect(addImport('@import "a.css";\n.x {}', "b.css")).toBe(
      '@import "a.css";\n@import "b.css";\n.x {}',
    );
  });

  it("does nothing when the import is there", () => {
    expect(addImport('@import "a.css";', "a.css")).toBe('@import "a.css";');
  });

  it("goes below leading comments in a file without imports", () => {
    expect(addImport("/* hi */\n.x {}", "a.css")).toBe('/* hi */\n@import "a.css";\n.x {}');
  });
});

describe("fingerprint", () => {
  it("ignores line endings and the final newline", () => {
    expect(fingerprint("a\r\nb\r\n")).toBe(fingerprint("a\nb"));
  });

  it("changes when the content does", () => {
    expect(fingerprint("a")).not.toBe(fingerprint("b"));
  });
});

describe("recordFiles", () => {
  it("merges fingerprints and sorts the keys", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "cladux-lock-"));
    await recordFiles(root, { "src/b.ts": "1" });
    await recordFiles(root, { "src/a.ts": "2", "src/b.ts": "3" });
    const lock = JSON.parse(await readFile(path.join(root, "cl-lock.json"), "utf8"));
    expect(Object.entries(lock.files)).toEqual([
      ["src/a.ts", "2"],
      ["src/b.ts", "3"],
    ]);
  });
});
