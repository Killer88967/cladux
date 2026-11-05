import path from "node:path";
import { Writable } from "node:stream";
import { stripVTControlCharacters } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pkg from "../../package.json" with { type: "json" };
import { DEFAULT_REGISTRY, readConfig } from "../utils/config.ts";
import { detectProject } from "../utils/detect.ts";
import { rewriteImports } from "../utils/files.ts";
import { installedCheck } from "../utils/installed.ts";
import { fetchDocs, fetchIndex, fetchNamed, locate, qualified } from "../utils/registry.ts";
import { output } from "../utils/ui.ts";
import { add } from "./add.ts";
import { apply } from "./apply.ts";

export interface McpOptions {
  cwd: string;
}

const INSTRUCTIONS = `Cladux is a React component library you copy into the project, like shadcn/ui: components arrive as source files the project owns, in Tailwind v4 or plain-CSS style.
Find components with list_items, read how to use one with get_docs, install with add_items, then import them from the components alias that get_project shows. Change the colors and radius with apply_theme.`;

/** What a tool sends back: text, or an error the assistant can read and act on. */
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const failed = (error: unknown) => ({ ...text((error as Error).message), isError: true });

/**
 * Runs a command and returns what it printed, as plain text. In stdio mode,
 * stdout carries the protocol, so the commands must not write to it directly.
 */
async function captured(run: () => Promise<unknown>) {
  const write = process.stdout.write;
  const chunks: string[] = [];
  process.stdout.write = ((chunk: string | Uint8Array, ...rest: unknown[]) => {
    chunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString());
    (rest.find((arg) => typeof arg === "function") as (() => void) | undefined)?.();
    return true;
  }) as typeof process.stdout.write;
  try {
    await run();
  } finally {
    process.stdout.write = write;
  }
  // Drop colors and the prompt library's frame (box lines and dots, or | o * without Unicode).
  return stripVTControlCharacters(chunks.join(""))
    .split("\n")
    .map((line) =>
      line
        .replace(/^[\u2500-\u257f\u25a0-\u25ff\u2022\u2714\u2716|]?(?:\s+|$)/u, "")
        .replace(/^[Tox*!\u2014](?: {2}|$)/u, "")
        .trimEnd(),
    )
    .filter((line) => line && line !== "Cladux")
    .join("\n");
}

/** The MCP server, with Cladux's tools for the project in `opts.cwd`. */
export function createServer(opts: McpOptions) {
  const root = path.resolve(opts.cwd);
  const server = new McpServer(
    { name: "cladux", title: "Cladux", version: pkg.version },
    { instructions: INSTRUCTIONS },
  );
  const project = async () => {
    const config = await readConfig(root);
    return { config, registry: config?.registry ?? DEFAULT_REGISTRY };
  };

  server.registerTool(
    "list_items",
    {
      title: "List components and blocks",
      description:
        "Every Cladux component and block, with a description. Pass a query to search names and descriptions.",
      inputSchema: { query: z.string().optional().describe("Words to search for, e.g. date") },
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => {
      try {
        const { config, registry } = await project();
        const index = await fetchIndex(registry);
        const installed = await installedCheck(root, config);
        const q = query?.toLowerCase();
        const items = index.items.filter(
          (i) =>
            (i.type === "registry:ui" || i.type === "registry:block") &&
            (!q || i.name.includes(q) || i.description?.toLowerCase().includes(q)),
        );
        if (!items.length) return text(`Nothing matches "${query}".`);
        return text(
          items
            .map((i) => {
              const tags = [
                i.type === "registry:block" ? "block" : "",
                i.new ? "new" : "",
                installed?.(i) ? "installed" : "",
              ].filter(Boolean);
              const about = i.description ? `: ${i.description}` : "";
              return `- ${i.name}${tags.length ? ` (${tags.join(", ")})` : ""}${about}`;
            })
            .join("\n"),
        );
      } catch (error) {
        return failed(error);
      }
    },
  );

  server.registerTool(
    "get_docs",
    {
      title: "Read a component's docs",
      description:
        "A component's docs as Markdown: what it's for, how to import and use it, its variants and props.",
      inputSchema: { name: z.string().describe("The component, e.g. button or @acme/card") },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      try {
        const { config, registry } = await project();
        const found = locate({ registry, registries: config?.registries }, name);
        const markdown = await fetchDocs(found.source, found.name);
        // The examples import from the package; in a project, show its own path.
        return text(
          config
            ? markdown.replaceAll(
                'from "@cladux/ui"',
                `from "${config.aliases.components}/${found.name}"`,
              )
            : markdown,
        );
      } catch (error) {
        return failed(error);
      }
    },
  );

  server.registerTool(
    "view_item",
    {
      title: "View an item's files",
      description:
        "The source files of a component or block, as add_items would write them, without installing anything.",
      inputSchema: { name: z.string().describe("The item, e.g. button or @acme/card") },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      try {
        const { config, registry } = await project();
        const item = await fetchNamed(
          { registry, registries: config?.registries },
          config?.style ?? "tailwind",
          name,
        );
        const files = item.files.map((f) => {
          const content =
            config && f.type !== "css" ? rewriteImports(f.content, config) : f.content;
          return `${f.path}\n\`\`\`${path.extname(f.path).slice(1)}\n${content.trimEnd()}\n\`\`\``;
        });
        const needs = item.registryDependencies.length
          ? `\nNeeds: ${item.registryDependencies.join(", ")}`
          : "";
        const packages = item.dependencies.length
          ? `\nPackages: ${item.dependencies.join(", ")}`
          : "";
        return text(
          `${qualified(item)}: ${item.description ?? ""}${needs}${packages}\n\n${files.join("\n\n")}`,
        );
      } catch (error) {
        return failed(error);
      }
    },
  );

  server.registerTool(
    "get_project",
    {
      title: "Read the project's setup",
      description:
        "The project's cl.json: its style, theme and import aliases, so you know where components live and how to import them.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const { config } = await project();
        if (!config) {
          return text(
            `No cl.json in ${root}. Ask the user to run \`npx cladux-ui@latest init\` there first.`,
          );
        }
        return text(
          [
            `Folder: ${root}`,
            `Style: ${config.style === "tailwind" ? "Tailwind v4 classes" : "plain CSS files (cl-* classes)"}`,
            `Theme: ${config.css.tokens ? (config.theme ?? "neutral") : "the project's own variables"}`,
            `Components: import { Button } from "${config.aliases.components}/button"`,
            `Aliases: ${Object.entries(config.aliases)
              .map(([key, value]) => `${key} ${value}`)
              .join(", ")}`,
          ].join("\n"),
        );
      } catch (error) {
        return failed(error);
      }
    },
  );

  server.registerTool(
    "add_items",
    {
      title: "Add components",
      description:
        "Writes components or blocks into the project, with everything they need. Files that already exist are kept unless overwrite is true. Any npm packages they need come back as a command for you to run.",
      inputSchema: {
        names: z.array(z.string()).min(1).describe("The items to add, e.g. ['button', 'card']"),
        overwrite: z
          .boolean()
          .optional()
          .describe("Replace the files of the named items if they exist"),
      },
      annotations: { destructiveHint: false },
    },
    async ({ names, overwrite }) => {
      try {
        // Installing can outlast a tool call's time limit, so the assistant runs it.
        const printed = await captured(() =>
          add({
            cwd: root,
            names,
            yes: true,
            all: false,
            overwrite: overwrite ?? false,
            skipInstall: true,
            dryRun: false,
            view: false,
            diff: false,
          }),
        );
        const result = printed.replace("Use --overwrite", "Pass overwrite: true");
        const packages = /Skipped installing: (.+)/.exec(result)?.[1];
        if (!packages) return text(result);
        const { packageManager: pm } = await detectProject(root);
        const command = `${pm} ${pm === "npm" ? "install" : "add"} ${packages}`;
        return text(
          `${result.replace(/.*Skipped installing: .+\n?/, "")}\nInstall the packages they need: ${command}`,
        );
      } catch (error) {
        return failed(error);
      }
    },
  );

  server.registerTool(
    "apply_theme",
    {
      title: "Apply a theme",
      description:
        "Applies a theme code from https://cladux.vercel.app/themes: a base color, then an optional accent, then an optional radius (none, sm, md, lg, xl). For example zinc, zinc-violet or stone-rose-lg.",
      inputSchema: { code: z.string().describe("The theme code, e.g. zinc-violet") },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ code }) => {
      try {
        return text(await captured(() => apply({ cwd: root, code })));
      } catch (error) {
        return failed(error);
      }
    },
  );

  return server;
}

/** `cladux mcp`: serves the tools over stdio, for AI assistants and editors. */
export async function mcp(opts: McpOptions) {
  // The protocol gets the real stdout. Anything else printed goes to stderr,
  // and package managers run quietly.
  const write = process.stdout.write.bind(process.stdout);
  const protocol = new Writable({
    write: (chunk: Buffer, _encoding, done) => void write(chunk, done),
  });
  process.stdout.write = process.stderr.write.bind(process.stderr) as typeof process.stdout.write;
  output.silent = true;
  await createServer(opts).connect(new StdioServerTransport(process.stdin, protocol));
}
