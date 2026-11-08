import { createRequire } from "node:module";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// One build per style: `vite build --mode tailwind` and `--mode css`. Each points
// @cladux/ui at that style's registry files from scripts/prepare.ts.
export default defineConfig(({ mode }) => {
  if (mode !== "tailwind" && mode !== "css") throw new Error("Use --mode tailwind or --mode css");
  const repo = path.resolve(import.meta.dirname, "../..");
  const generated = path.join(repo, "packages/ui/.visual", mode);
  const src = path.join(import.meta.dirname, "src");
  // cl-utils.ts needs clsx and tailwind-merge, which @cladux/utils has.
  const fromUtils = createRequire(path.join(repo, "packages/utils/package.json"));
  const utilsDeps = ["clsx", "tailwind-merge"].map((name) => ({
    find: new RegExp(`^${name}$`),
    replacement: fromUtils.resolve(name),
  }));
  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: /^@cladux\/ui$/, replacement: path.join(generated, "index.ts") },
        { find: /^@cladux\/utils$/, replacement: path.join(repo, "packages/utils/src/index.ts") },
        // The registry's own import paths, as a project would have them.
        { find: /^@\//, replacement: `${generated}/` },
        { find: /^@examples\//, replacement: path.join(repo, "packages/ui/src") + "/" },
        { find: /^@style$/, replacement: path.join(src, `${mode}.css`) },
        // A few demos use Next.js's Link and Image.
        { find: /^next\/link$/, replacement: path.join(src, "stubs/link.tsx") },
        { find: /^next\/image$/, replacement: path.join(src, "stubs/image.tsx") },
        ...utilsDeps,
      ],
      dedupe: ["react", "react-dom"],
    },
    build: { outDir: `dist/${mode}`, emptyOutDir: true, chunkSizeWarningLimit: 20_000 },
    logLevel: "warn",
  };
});
