import { describe, expect, it } from "vitest";
import { REGISTRY_ALIASES } from "../src/registry.ts";
import { rewriteImports } from "../src/rewrite.ts";

const aliases = {
  components: "~/ui",
  hooks: "~/hooks",
  lib: "~/lib",
  utils: "~/lib/utils",
};

describe("rewriteImports", () => {
  it("swaps every registry alias for the project's own", () => {
    const source = [
      'import { cn } from "@/lib/cl-utils";',
      'import { Button } from "@/components/cl/button";',
      'import { useMobile } from "@/hooks/use-mobile";',
      'import { highlight } from "@/lib/highlighter";',
    ].join("\n");
    expect(rewriteImports(source, aliases)).toBe(
      [
        'import { cn } from "~/lib/utils";',
        'import { Button } from "~/ui/button";',
        'import { useMobile } from "~/hooks/use-mobile";',
        'import { highlight } from "~/lib/highlighter";',
      ].join("\n"),
    );
  });

  it("leaves other imports alone", () => {
    const source = 'import x from "@/app/page";\nimport y from "react";\n';
    expect(rewriteImports(source, aliases)).toBe(source);
  });

  it("changes nothing with the registry's own aliases", () => {
    const source = 'import { cn } from "@/lib/cl-utils";';
    expect(rewriteImports(source, REGISTRY_ALIASES)).toBe(source);
  });
});
