// Bundles the CLI into dist/. The css-style converter (Babel, PostCSS) and the MCP
// SDK go in their own chunks that only `build` and `mcp` load, so the other
// commands start as fast as before.
//
// Everything is bundled and minified rather than installed as dependencies: the
// MCP SDK alone depends on express, hono, jose and more, which would make every
// `npx cladux-ui` download several MB of packages the CLI never runs.
import { chmod, rm } from "node:fs/promises";
import { build, type Plugin } from "esbuild";

const zodEnglishOnly: Plugin = {
  name: "zod-english-only",
  setup(build) {
    build.onLoad({ filter: /[\\/]zod[\\/]v4[\\/]locales[\\/]index\.js$/ }, () => ({
      contents: 'export { default as en } from "./en.js";',
    }));
  },
};

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
  minify: true,
  plugins: [zodEnglishOnly],
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
