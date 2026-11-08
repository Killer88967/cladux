import { describe, expect, it } from "vitest";
import { configIssues, indexIssues, itemIssues, sourceIssues } from "../src/schema.ts";

const item = {
  name: "date-picker",
  type: "registry:ui",
  style: "css",
  dependencies: ["react-day-picker@^9.0.0"],
  registryDependencies: ["utils", "@acme/calendar"],
  files: [{ path: "date-picker.tsx", type: "ui", content: "export {};" }],
};

describe("itemIssues", () => {
  it("passes a valid item", () => {
    expect(itemIssues(item)).toEqual([]);
  });

  it("says which field is missing", () => {
    const { files: _files, ...rest } = item;
    expect(itemIssues(rest)).toEqual(['missing "files"']);
  });

  it("explains a bad name, path and dependency", () => {
    expect(
      itemIssues({
        ...item,
        name: "Date Picker",
        dependencies: ["not a package!"],
        files: [{ path: "../escape.tsx", type: "ui", content: "" }],
      }),
    ).toEqual(
      expect.arrayContaining([
        "name must be lowercase words joined by dashes, such as date-picker",
        "dependencies[0] must be an npm package, such as clsx@^2.1.1",
        "files[0].path must be a path inside its folder, without a leading / or ..",
      ]),
    );
  });

  it("names unknown fields and wrong types", () => {
    expect(itemIssues({ ...item, extra: true, type: "registry:nope" })).toEqual(
      expect.arrayContaining([
        '"extra" isn\'t a known field',
        expect.stringMatching(/^type must be one of/),
      ]),
    );
  });
});

describe("configIssues", () => {
  const config = {
    style: "css",
    tsx: true,
    framework: "next",
    registry: "https://cladux.vercel.app/r",
    css: {
      globals: "src/app/globals.css",
      dir: "src/styles/cl",
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

  it("passes a full cl.json", () => {
    expect(configIssues(config)).toEqual([]);
  });

  it("names a missing field inside an object", () => {
    const { tokens: _tokens, ...css } = config.css;
    expect(configIssues({ ...config, css })).toEqual(['css: missing "tokens"']);
  });

  it("explains a bad registry entry and namespace", () => {
    expect(configIssues({ ...config, registries: { "@acme": 5 } })).toEqual([
      'registries.@acme must be a URL or folder, or { "url": ..., "headers": { ... } }',
    ]);
    expect(configIssues({ ...config, registries: { acme: "https://x.dev/r" } })).toEqual([
      'registries: "acme" must start with @, such as @acme',
    ]);
  });
});

describe("indexIssues", () => {
  it("passes an index and catches a missing list", () => {
    expect(indexIssues({ styles: ["css"], items: [] })).toEqual([]);
    expect(indexIssues({ styles: ["css"] })).toEqual(['missing "items"']);
  });
});

describe("sourceIssues", () => {
  it("accepts file paths as strings", () => {
    expect(sourceIssues({ items: [{ name: "badge", files: ["src/badge.tsx"] }] })).toEqual([]);
  });
});
