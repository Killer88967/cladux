// Takes a screenshot of every demo in both styles, from the harness builds
// (run `pnpm --filter visual harness` first):
//
//   screenshots/<style>/<variant>/<demo>.png
//
// Every demo in light, left to right; each component's main demo (<name>-demo)
// also in dark, right to left, and both. To keep them the same from run to run,
// the clock is fixed, Math.random is seeded, animations are off, and images
// from other sites are a gray placeholder.
//
//   node scripts/shoot.ts [--out screenshots] [--only <regex>]
import { createServer, type Server } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Page } from "@playwright/test";
import { PNG } from "pngjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const { values } = parseArgs({
  options: { out: { type: "string", default: "screenshots" }, only: { type: "string" } },
});
const OUT = path.resolve(ROOT, values.out!);
const only = values.only ? new RegExp(values.only) : null;

const STYLES = ["tailwind", "css"] as const;
const VARIANTS = [
  { name: "light-ltr", dark: false, rtl: false, all: true },
  { name: "dark-ltr", dark: true, rtl: false, all: false },
  { name: "light-rtl", dark: false, rtl: true, all: false },
  { name: "dark-rtl", dark: true, rtl: true, all: false },
];
const FIXED_TIME = new Date("2026-03-15T12:00:00Z");

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

/** A gray 64 × 64 PNG, for images from other sites and ones the demos expect on the site. */
const image = (() => {
  const png = new PNG({ width: 64, height: 64 });
  png.data.fill(200);
  return PNG.sync.write(png);
})();

/** Serves a folder on a free port. */
async function serve(dir: string) {
  const server: Server = createServer(async (req, res) => {
    let pathname = decodeURIComponent(new URL(req.url!, "http://x").pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.join(dir, pathname);
    const body = await readFile(file).catch(() => null);
    // Some demos use the site's own images (/avatars/...): a placeholder stands in.
    if (!body && /\.(png|jpe?g|webp|gif|svg|avif)$/.test(pathname)) {
      return void res.writeHead(200, { "content-type": "image/png" }).end(image);
    }
    if (!body) return void res.writeHead(404).end();
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`, server };
}

/** Waits for images, fonts and two frames, so the screenshot shows the settled demo. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) => new Promise((resolve) => img.addEventListener("load", resolve, { once: true })),
        ),
    );
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForTimeout(150);
}

await rm(OUT, { recursive: true, force: true });
const browser = await chromium.launch();
const errors: Record<string, string[]> = {};
let count = 0;

for (const style of STYLES) {
  const { url, server } = await serve(path.join(ROOT, "dist", style));
  const context = await browser.newContext({
    viewport: { width: 1000, height: 900 },
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "UTC",
  });
  await context.route(
    (u) => !u.href.startsWith(url) && !u.href.startsWith("data:"),
    (route) =>
      route.request().resourceType() === "image"
        ? route.fulfill({ body: image, contentType: "image/png" })
        : route.abort(),
  );
  const page = await context.newPage();
  await page.clock.setFixedTime(FIXED_TIME);
  // A seeded Math.random, started over for each demo.
  await page.addInitScript(() => {
    let seed = 1;
    (window as any).__reseed = () => (seed = 1);
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  });
  let current = "";
  page.on("pageerror", (error) => (errors[current] ??= []).push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") (errors[current] ??= []).push(message.text());
  });

  await page.goto(url);
  await page.waitForFunction(() => Array.isArray((window as any).__demos));
  await page.addStyleTag({
    content:
      "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; caret-color: transparent !important; }",
  });
  const demos: string[] = (await page.evaluate(() => (window as any).__demos)).filter(
    (name: string) => !only || only.test(name),
  );

  for (const variant of VARIANTS) {
    await page.evaluate(({ dark, rtl }) => {
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.dir = rtl ? "rtl" : "ltr";
    }, variant);
    const dir = path.join(OUT, style, variant.name);
    await mkdir(dir, { recursive: true });
    for (const name of demos) {
      if (!variant.all && !name.endsWith("-demo")) continue;
      current = `${style}/${variant.name}/${name}`;
      await page.evaluate((n) => {
        (window as any).__reseed();
        return (window as any).__show(n);
      }, name);
      await settle(page);
      await page
        .locator("#stage")
        .screenshot({ path: path.join(dir, `${name}.png`), animations: "disabled" });
      count++;
    }
    console.log(`shoot: ${style} ${variant.name}`);
  }
  await context.close();
  server.close();
}
await browser.close();

await writeFile(path.join(OUT, "errors.json"), JSON.stringify(errors, null, 2));
const crashed = Object.keys(errors);
console.log(`shoot: ${count} screenshots in ${path.relative(process.cwd(), OUT)}`);
if (crashed.length) console.log(`shoot: errors in ${crashed.length} demos, see errors.json`);
