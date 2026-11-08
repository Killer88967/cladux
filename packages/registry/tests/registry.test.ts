import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CLADUX_REGISTRY,
  fetchIndex,
  fetchNamed,
  loadText,
  locate,
  NotFoundError,
  qualified,
  RegistryError,
  resolveItems,
} from "../src/registry.ts";
import { ITEMS, removeRegistry, serve, writeRegistry } from "./helpers.ts";

let dir = "";
beforeAll(async () => {
  dir = await writeRegistry();
});
afterAll(() => removeRegistry(dir));

describe("loadText", () => {
  it("reads a file from a folder", async () => {
    const index = JSON.parse(await loadText(dir, "index.json"));
    expect(index.styles).toEqual(["tailwind", "css"]);
  });

  it("throws NotFoundError for a file that isn't there", async () => {
    await expect(loadText(dir, "css/nope.json")).rejects.toBeInstanceOf(NotFoundError);
    await expect(loadText(dir, "css/nope.json")).rejects.toThrow(
      '"css/nope.json" isn\'t in the registry',
    );
  });

  describe("over HTTP", () => {
    let server: Awaited<ReturnType<typeof serve>>;
    beforeAll(async () => {
      server = await serve(dir, { "locked.json": 401, "broken.json": 500 });
    });
    afterAll(() => server.close());
    afterEach(() => {
      server.requests.length = 0;
    });

    it("fetches a file, with a trailing slash on the URL or without", async () => {
      expect((await fetchIndex(server.url)).items).toHaveLength(4);
      expect((await fetchIndex(`${server.url}/`)).items).toHaveLength(4);
    });

    it("sends the headers it's given", async () => {
      await loadText({ url: server.url, headers: { authorization: "Bearer abc" } }, "index.json");
      expect(server.requests[0]?.headers.authorization).toBe("Bearer abc");
    });

    it("turns a 404 into NotFoundError", async () => {
      await expect(loadText(server.url, "css/nope.json")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("says to check the headers when access is refused", async () => {
      await expect(loadText(server.url, "locked.json")).rejects.toThrow(
        /refused access \(401\)\. Check its headers in cl\.json/,
      );
      await expect(loadText(server.url, "locked.json")).rejects.toBeInstanceOf(RegistryError);
    });

    it("reports other errors with the status", async () => {
      await expect(loadText(server.url, "broken.json")).rejects.toThrow(/returned 500/);
    });

    it("says when the registry can't be reached", async () => {
      await expect(loadText("http://127.0.0.1:1/r", "index.json")).rejects.toThrow(
        /Couldn't reach the registry/,
      );
    });
  });
});

describe("locate", () => {
  const config = {
    registry: "https://example.com/r",
    registries: {
      "@acme": "https://acme.dev/r",
      "@private": {
        url: "https://${HOST}/r",
        headers: { authorization: "Bearer ${TOKEN}" },
      },
    },
  };

  it("finds a plain name in the default registry", () => {
    expect(locate(config, "button")).toEqual({ name: "button", source: "https://example.com/r" });
  });

  it("finds a namespaced name in its registry", () => {
    expect(locate(config, "@acme/button")).toMatchObject({
      namespace: "@acme",
      name: "button",
      source: { url: "https://acme.dev/r", headers: {} },
    });
  });

  it("knows @cladux without configuration", () => {
    expect(locate({ registry: "./r" }, "@cladux/button").source).toEqual({
      url: CLADUX_REGISTRY,
      headers: {},
    });
  });

  it("puts a plain dependency in the registry of the item that needs it", () => {
    expect(locate(config, "button", "@acme")).toMatchObject({ namespace: "@acme" });
  });

  it("fills ${VARIABLES} in from the environment", () => {
    process.env.HOST = "secret.dev";
    process.env.TOKEN = "abc";
    try {
      expect(locate(config, "@private/button").source).toEqual({
        url: "https://secret.dev/r",
        headers: { authorization: "Bearer abc" },
      });
    } finally {
      delete process.env.HOST;
      delete process.env.TOKEN;
    }
  });

  it("says which variable is missing", () => {
    expect(() => locate(config, "@private/button")).toThrow(
      "@private needs HOST, which isn't set.",
    );
  });

  it("says how to add an unknown registry", () => {
    expect(() => locate(config, "@nope/button")).toThrow(
      'Unknown registry @nope. Add it to "registries" in cl.json.',
    );
  });
});

describe("resolveItems", () => {
  it("returns dependencies first, each item once", async () => {
    const items = await resolveItems({ registry: dir }, "css", ["hero-01", "button", "card"]);
    expect(items.map((i) => i.name)).toEqual(["utils", "button", "card", "hero-01"]);
    expect(items.every((i) => i.style === "css")).toBe(true);
  });

  it("gets plain dependencies of a namespaced item from the same registry", async () => {
    const config = { registry: "/nowhere", registries: { "@acme": dir } };
    const items = await resolveItems(config, "tailwind", ["@acme/card"]);
    expect(items.map(qualified)).toEqual(["@acme/utils", "@acme/button", "@acme/card"]);
  });

  it("stops at circular dependencies instead of looping", async () => {
    const looped = await writeRegistry({
      ...ITEMS,
      utils: { ...ITEMS.utils!, registryDependencies: ["card"] },
    });
    try {
      const items = await resolveItems({ registry: looped }, "css", ["card"]);
      expect(items.map((i) => i.name).sort()).toEqual(["button", "card", "utils"]);
    } finally {
      await removeRegistry(looped);
    }
  });

  it("fails on an item that doesn't exist", async () => {
    await expect(resolveItems({ registry: dir }, "css", ["nope"])).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("fetchNamed", () => {
  it("marks items from another registry with their namespace", async () => {
    const item = await fetchNamed(
      { registry: "/nowhere", registries: { "@acme": dir } },
      "css",
      "@acme/button",
    );
    expect(qualified(item)).toBe("@acme/button");
    expect(qualified(await fetchNamed({ registry: dir }, "css", "button"))).toBe("button");
  });
});
