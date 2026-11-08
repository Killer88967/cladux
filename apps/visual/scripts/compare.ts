// Compares screenshots and writes an HTML report of what differs.
//
//   node scripts/compare.ts styles [dir]   Tailwind against plain CSS, in one run.
//                                          Fails when a component looks different
//                                          in the two styles. --update writes the
//                                          ones that differ now into known.ts.
//   node scripts/compare.ts runs <a> <b>   Two runs, such as a pull request's base
//                                          and head. Lists what changed; doesn't fail.
//
// The report goes to report/<mode>/index.html, with the images next to it.
import { existsSync } from "node:fs";
import { appendFile, copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { KNOWN_STYLE_DIFFERENCES, UNSTABLE } from "./known.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const update = process.argv.includes("--update");
const [mode, ...args] = process.argv.slice(2).filter((a) => a !== "--update");
if (mode !== "styles" && mode !== "runs") {
  throw new Error("Usage: compare.ts styles [dir] | compare.ts runs <a> <b>");
}

/** How much of a screenshot can differ, as a share of its pixels, before it counts. */
const LIMIT = 0.002;

/** Every PNG under a folder, by its path inside it, leaving out the unstable demos. */
async function pngs(dir: string) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { recursive: true }))
    .filter((f) => f.endsWith(".png") && !UNSTABLE.includes(path.basename(f, ".png")))
    .sort();
}

/** Puts an image on a canvas of the given size, so two sizes can be compared. */
function pad(png: PNG, width: number, height: number) {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  out.data.fill(255);
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

interface Row {
  name: string;
  ratio: number;
  note?: string;
  a?: string;
  b?: string;
  diff?: string;
}

async function compare(a: string, b: string, names: string[], out: string) {
  const rows: Row[] = [];
  for (const name of names) {
    const [fa, fb] = [path.join(a, name), path.join(b, name)];
    if (!existsSync(fa) || !existsSync(fb)) {
      rows.push({
        name,
        ratio: 1,
        note: existsSync(fa) ? "only in the first" : "only in the second",
      });
      continue;
    }
    const [pa, pb] = await Promise.all([fa, fb].map(async (f) => PNG.sync.read(await readFile(f))));
    const width = Math.max(pa!.width, pb!.width);
    const height = Math.max(pa!.height, pb!.height);
    const diff = new PNG({ width, height });
    const changed = pixelmatch(
      pad(pa!, width, height).data,
      pad(pb!, width, height).data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
      },
    );
    const ratio = changed / (width * height);
    const row: Row = { name, ratio };
    if (pa!.width !== pb!.width || pa!.height !== pb!.height) {
      row.note = `${pa!.width}×${pa!.height} vs ${pb!.width}×${pb!.height}`;
    }
    if (ratio > LIMIT) {
      const slug = name.replaceAll("/", "__");
      await Promise.all([
        copyFile(fa, path.join(out, `a__${slug}`)),
        copyFile(fb, path.join(out, `b__${slug}`)),
        writeFile(path.join(out, `diff__${slug}`), PNG.sync.write(diff)),
      ]);
      Object.assign(row, { a: `a__${slug}`, b: `b__${slug}`, diff: `diff__${slug}` });
    }
    rows.push(row);
  }
  return rows.sort((x, y) => y.ratio - x.ratio);
}

function report(title: string, labels: [string, string], rows: Row[]) {
  const percent = (r: number) => `${(r * 100).toFixed(2)}%`;
  const items = rows
    .filter((r) => r.ratio > LIMIT)
    .map(
      (r) => `<section><h2>${r.name} <small>${percent(r.ratio)} ${r.note ?? ""}</small></h2>
<div class="row">${r.a ? `<figure><img src="${r.a}"><figcaption>${labels[0]}</figcaption></figure><figure><img src="${r.b}"><figcaption>${labels[1]}</figcaption></figure><figure><img src="${r.diff}"><figcaption>difference</figcaption></figure>` : ""}</div></section>`,
    )
    .join("\n");
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<style>body{font:14px system-ui;margin:2rem;color:#111}h2{font-size:15px;margin:2rem 0 .5rem}small{color:#666;font-weight:400}.row{display:flex;gap:1rem;align-items:flex-start;overflow-x:auto}figure{margin:0}img{max-width:420px;border:1px solid #ddd}figcaption{color:#666;font-size:12px}</style>
<h1>${title}</h1><p>${rows.filter((r) => r.ratio > LIMIT).length} of ${rows.length} screenshots differ by more than ${percent(LIMIT)}.</p>${items}`;
}

const out = path.join(ROOT, "report", mode);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

if (mode === "styles") {
  const dir = path.resolve(ROOT, args[0] ?? "screenshots");
  const [a, b] = [path.join(dir, "tailwind"), path.join(dir, "css")];
  const names = [...new Set([...(await pngs(a)), ...(await pngs(b))])];
  const rows = await compare(a, b, names, out);
  await writeFile(
    path.join(out, "index.html"),
    report("Tailwind and plain CSS", ["Tailwind", "CSS"], rows),
  );

  const demo = (r: Row) => path.basename(r.name, ".png");
  const failing = rows.filter((r) => r.ratio > LIMIT && !KNOWN_STYLE_DIFFERENCES[demo(r)]);
  const fixed = Object.keys(KNOWN_STYLE_DIFFERENCES).filter(
    (name) => !rows.some((r) => demo(r) === name && r.ratio > LIMIT),
  );
  console.log(
    `compare: ${rows.length} pairs, ${rows.filter((r) => r.ratio > LIMIT).length} differ`,
  );

  if (update) {
    // Keep the reasons already written; new ones say how much they differ.
    const worst = new Map<string, number>();
    for (const r of rows)
      if (r.ratio > LIMIT) worst.set(demo(r), Math.max(worst.get(demo(r)) ?? 0, r.ratio));
    const entries = [...worst]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, ratio]) => {
        const reason =
          KNOWN_STYLE_DIFFERENCES[name] ??
          `Differs by up to ${(ratio * 100).toFixed(1)}%. Not looked into yet.`;
        return `  ${JSON.stringify(name)}: ${JSON.stringify(reason)},`;
      });
    const file = path.join(ROOT, "scripts/known.ts");
    const source = await readFile(file, "utf8");
    await writeFile(
      file,
      source.replace(
        /export const KNOWN_STYLE_DIFFERENCES[\s\S]*$/,
        `export const KNOWN_STYLE_DIFFERENCES: Record<string, string> = {\n${entries.join("\n")}\n};\n`,
      ),
    );
    console.log(`compare: wrote ${entries.length} demos to scripts/known.ts`);
    process.exit(0);
  }
  if (fixed.length)
    console.log(`compare: these now match, remove them from known.ts: ${fixed.join(", ")}`);
  if (failing.length) {
    console.error(
      `\nThese look different in the plain CSS style (report/styles/index.html):\n${failing
        .map((r) => `  ${r.name}  ${(r.ratio * 100).toFixed(2)}% ${r.note ?? ""}`)
        .join("\n")}`,
    );
    process.exit(1);
  }
} else {
  const [a, b] = args.map((d) => path.resolve(d));
  if (!a || !b) throw new Error("Usage: compare.ts runs <a> <b>");
  const names = [...new Set([...(await pngs(a)), ...(await pngs(b))])];
  const rows = await compare(a, b, names, out);
  await writeFile(
    path.join(out, "index.html"),
    report("Visual changes", ["before", "after"], rows),
  );
  const changed = rows.filter((r) => r.ratio > LIMIT);
  const summary = changed.length
    ? `### ${changed.length} of ${rows.length} screenshots changed\n\n${changed
        .map((r) => `- \`${r.name}\` ${(r.ratio * 100).toFixed(2)}% ${r.note ?? ""}`)
        .join("\n")}\n\nDownload the **visual-report** artifact to see them side by side.\n`
    : `### No visual changes in ${rows.length} screenshots\n`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
}
