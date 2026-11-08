import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer, type IncomingHttpHeaders } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import type { RegistryIndex, RegistryItem } from "../src/registry.ts";

type Item = Omit<RegistryItem, "name" | "style">;

/** A small registry in both styles: utils, button, card (needs button), hero-01 (needs card). */
export const ITEMS: Record<string, Item> = {
  utils: {
    type: "registry:lib",
    dependencies: ["clsx@^2.1.1"],
    registryDependencies: [],
    files: [{ path: "cl-utils.ts", type: "lib", content: 'import { clsx } from "clsx";\n' }],
  },
  button: {
    type: "registry:ui",
    description: "A button.",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [
      {
        path: "button.tsx",
        type: "ui",
        content: 'import { cn } from "@/lib/cl-utils";\nexport function Button() {}\n',
      },
    ],
  },
  card: {
    type: "registry:ui",
    dependencies: [],
    registryDependencies: ["button"],
    files: [
      {
        path: "card.tsx",
        type: "ui",
        content: 'import { Button } from "@/components/cl/button";\nexport function Card() {}\n',
      },
    ],
  },
  "hero-01": {
    type: "registry:block",
    dependencies: [],
    registryDependencies: ["card"],
    files: [
      {
        path: "blocks/hero-01.tsx",
        type: "ui",
        content:
          'import { Card } from "@/components/cl/card";\nexport default function Hero() {}\n',
      },
    ],
  },
};

export const STYLES = ["tailwind", "css"];

/** Writes the registry to a new temporary folder and returns its path. */
export async function writeRegistry(items: Record<string, Item> = ITEMS) {
  const dir = await mkdtemp(path.join(tmpdir(), "cladux-registry-"));
  const index: RegistryIndex = {
    styles: STYLES,
    items: Object.entries(items).map(([name, item]) => ({
      name,
      type: item.type,
      ...(item.description ? { description: item.description } : {}),
      registryDependencies: item.registryDependencies,
    })),
  };
  await writeFile(path.join(dir, "index.json"), JSON.stringify(index));
  for (const style of STYLES) {
    await mkdir(path.join(dir, style), { recursive: true });
    for (const [name, item] of Object.entries(items)) {
      await writeFile(
        path.join(dir, style, `${name}.json`),
        JSON.stringify({ name, style, ...item }),
      );
    }
  }
  return dir;
}

export const removeRegistry = (dir: string) => rm(dir, { recursive: true, force: true });

/**
 * Serves a registry folder over HTTP on a free port. `status` can force an
 * answer for a file; every request's headers are kept in `requests`.
 */
export async function serve(dir: string, status: Record<string, number> = {}) {
  const { readFile } = await import("node:fs/promises");
  const requests: { url: string; headers: IncomingHttpHeaders }[] = [];
  const server = createServer(async (req, res) => {
    const file = (req.url ?? "/").replace(/^\/r\//, "");
    requests.push({ url: file, headers: req.headers });
    if (status[file]) {
      res.writeHead(status[file]).end();
      return;
    }
    const body = await readFile(path.join(dir, file)).catch(() => null);
    if (body) res.writeHead(200, { "content-type": "application/json" }).end(body);
    else res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/r`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
