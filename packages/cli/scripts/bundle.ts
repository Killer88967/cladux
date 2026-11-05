// Bundles the CLI into dist/. The css-style converter (Babel, PostCSS) and the MCP
// SDK go in their own chunks that only `build` and `mcp` load, so the other
// commands start as fast as before.
import { chmod, rm } from "node:fs/promises";
import { build } from "esbuild";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await build({
  entryPoints: [new URL("../src/index.ts", import.meta.url).pathname],
  outdir: dist.pathname,
  bundle: true,
  splitting: true,
  chunkNames: "chunks/[name]-[hash]",
  platform: "node",
  format: "esm",
  target: "node20",
  banner: {
    js: [
      "#!/usr/bin/env node",
      // Bundled CommonJS packages call require(), which ES modules don't have.
      'import { createRequire as __createRequire } from "node:module";',
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  logLevel: "info",
});
await chmod(new URL("index.js", dist), 0o755);
