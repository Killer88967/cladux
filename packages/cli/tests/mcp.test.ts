import { existsSync } from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeEach, describe, expect, it } from "vitest";
import { init } from "../src/commands/init.ts";
import { createServer } from "../src/commands/mcp.ts";
import { read, useProject } from "./helpers.ts";

const ctx = useProject();
let client: Client;

beforeEach(async () => {
  await init({
    cwd: ctx.root,
    yes: true,
    force: false,
    skipInstall: true,
    style: "css",
    registry: ctx.registry,
  });
  // A client and the server, connected in memory instead of over stdio.
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer({ cwd: ctx.root }).connect(serverSide);
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(clientSide);
});

/** Calls a tool and returns its text, and whether it's an error. */
async function call(name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  const [first] = result.content as { type: string; text: string }[];
  return { text: first?.text ?? "", isError: Boolean(result.isError) };
}

describe("mcp", () => {
  it("has the tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "add_items",
      "apply_theme",
      "get_docs",
      "get_project",
      "list_items",
      "view_item",
    ]);
  });

  it("lists and searches items", async () => {
    const all = await call("list_items");
    expect(all.text).toContain("- card: A card with a button.");
    expect(all.text).toContain("- hero-01 (block): A hero section.");
    expect(all.text).not.toContain("utils");
    const found = await call("list_items", { query: "hero" });
    expect(found.text).toContain("hero-01");
    expect(found.text).not.toContain("card");
  });

  it("shows docs and files with the project's import paths", async () => {
    const docs = await call("get_docs", { name: "button" });
    expect(docs.text).toContain('import { Button } from "@/components/cl/button";');
    const view = await call("view_item", { name: "card" });
    expect(view.text).toContain("Needs: button");
    expect(view.text).toContain('from "@/components/cl/button"');
  });

  it("describes the project", async () => {
    const { text } = await call("get_project");
    expect(text).toContain("Style: plain CSS files");
    expect(text).toContain('import { Button } from "@/components/cl/button"');
  });

  it("adds items, and lists them as installed", async () => {
    const result = await call("add_items", { names: ["card"] });
    expect(result.isError).toBe(false);
    expect(result.text).toContain("src/components/cl/card.tsx");
    expect(existsSync(path.join(ctx.root, "src/components/cl/button.tsx"))).toBe(true);
    expect((await call("list_items", { query: "card" })).text).toContain("(installed)");
  });

  it("applies a theme", async () => {
    const result = await call("apply_theme", { code: "zinc-blue" });
    expect(result.text).toContain("Applied zinc-blue");
    expect(await read(ctx.root, "src/styles/cl-tokens.css")).toContain("--cl-primary: blue;");
  });

  it("returns errors the assistant can act on", async () => {
    const docs = await call("get_docs", { name: "nope" });
    expect(docs.isError).toBe(true);
    expect(docs.text).toContain("isn't in the registry");
    const theme = await call("apply_theme", { code: "zinx" });
    expect(theme.isError).toBe(true);
    expect(theme.text).toContain('"zinx" isn\'t a base color');
  });
});
