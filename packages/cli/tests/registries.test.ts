import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { add } from "../src/commands/add.ts";
import { init } from "../src/commands/init.ts";
import { configIssues } from "../src/utils/schema.ts";
import { read, useProject } from "./helpers.ts";

const ctx = useProject();
let acme = "";

/** A second registry with one item that needs a component from the same registry. */
async function writeAcme(dir: string) {
  const items = [
    {
      name: "fancy-card",
      type: "registry:ui",
      style: "css",
      dependencies: [],
      registryDependencies: ["sparkle"],
      files: [
        {
          path: "fancy-card.tsx",
          type: "ui",
          content:
            'import { Sparkle } from "@/components/cl/sparkle";\nexport function FancyCard() {}\n',
        },
      ],
    },
    {
      name: "sparkle",
      type: "registry:ui",
      style: "css",
      dependencies: [],
      registryDependencies: [],
      files: [{ path: "sparkle.tsx", type: "ui", content: "export function Sparkle() {}\n" }],
    },
  ];
  await mkdir(path.join(dir, "css"), { recursive: true });
  for (const item of items) {
    await writeFile(path.join(dir, "css", `${item.name}.json`), JSON.stringify(item));
  }
}

/** Points cl.json's "registries" at what the test needs. */
async function setRegistries(registries: unknown) {
  const file = path.join(ctx.root, "cl.json");
  const config = JSON.parse(await readFile(file, "utf8"));
  await writeFile(file, JSON.stringify({ ...config, registries }));
}

const runAdd = (names: string[]) =>
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
  });

beforeEach(async () => {
  await init({
    cwd: ctx.root,
    yes: true,
    force: false,
    skipInstall: true,
    style: "css",
    registry: ctx.registry,
  });
  acme = path.join(path.dirname(ctx.root), "acme");
  await writeAcme(acme);
});

describe("registries", () => {
  it("adds an item and its dependencies from a named registry", async () => {
    await setRegistries({ "@acme": acme });
    await runAdd(["@acme/fancy-card"]);
    expect(existsSync(path.join(ctx.root, "src/components/cl/fancy-card.tsx"))).toBe(true);
    // Its plain dependency came from @acme too.
    expect(await read(ctx.root, "src/components/cl/sparkle.tsx")).toContain("Sparkle");
  });

  it("names a registry that isn't in cl.json", async () => {
    await expect(runAdd(["@nope/thing"])).rejects.toThrow("Unknown registry @nope");
  });

  it("says which environment variable is missing", async () => {
    await setRegistries({ "@acme": { url: acme, headers: { Authorization: "Bearer ${NOPE}" } } });
    await expect(runAdd(["@acme/fancy-card"])).rejects.toThrow("@acme needs NOPE, which isn't set");
  });

  describe("over HTTP", () => {
    let server: Server;
    let url = "";
    beforeEach(async () => {
      // Answers only with the right token, like a private registry.
      server = createServer(async (req, res) => {
        if (req.headers.authorization !== "Bearer secret") return res.writeHead(401).end();
        try {
          res.end(await readFile(path.join(acme, req.url!)));
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      url = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
    });
    afterEach(() => new Promise<void>((resolve) => server.close(() => resolve())));

    it("sends the headers, with the token from the environment", async () => {
      process.env.ACME_TOKEN = "secret";
      await setRegistries({ "@acme": { url, headers: { Authorization: "Bearer ${ACME_TOKEN}" } } });
      await runAdd(["@acme/fancy-card"]);
      expect(existsSync(path.join(ctx.root, "src/components/cl/fancy-card.tsx"))).toBe(true);
      delete process.env.ACME_TOKEN;
    });

    it("says when the registry refuses access", async () => {
      await setRegistries({ "@acme": url });
      await expect(runAdd(["@acme/fancy-card"])).rejects.toThrow("refused access (401)");
    });
  });
});

describe("cl.json registries", () => {
  it("wants namespaces to start with @", async () => {
    const config = JSON.parse(await read(ctx.root, "cl.json"));
    expect(configIssues({ ...config, registries: { acme: "https://acme.dev/r" } })).toEqual([
      'registries: "acme" must start with @, such as @acme',
    ]);
  });
});
