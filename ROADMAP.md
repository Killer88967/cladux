# Cladux roadmap

Where Cladux is going, in the order we plan to build it. Done items move to the
changelog at /docs/changelog.

## Done

- 72 components in shadcn's nova look, including 22 shadcn doesn't have
- Two styles from one source: Tailwind classes, or plain CSS files per component
- CLI: `cladux init` and `cladux add`, alongside shadcn without clashing
- Site: docs, 14 blocks, 5 examples, themes, colors, changelog
- Registry live at https://cladux.vercel.app/r

## 0.1 - Publish

- [x] Changesets for versioning and changelogs
- [x] `prepublishOnly` build, check the published files with `npm pack --dry-run`
- [x] README for the `cladux-ui` package (install, commands, links)
- [x] Publish `cladux-ui` to npm
- [x] GitHub Actions: typecheck, build and format check on every push

## 0.2 - CLI essentials

- [x] `add --dry-run`, `--diff`, `--view`, `--path`, `--silent`
- [x] `cladux list`: components and blocks, the new ones marked
- [x] `cladux search <query>`
- [x] `cladux view <name>`: an item's files without installing it
- [x] `cladux info`: style, aliases, installed items, versions
- [x] `cladux docs <name>`: usage and props in the terminal
- [x] `cladux diff`: what changed upstream since you added a component
- [x] `cladux update`: pull upstream changes without losing your edits
- [x] Vitest tests for every command

## 0.3 - Registry

- [x] `cladux-registry`: fetch, resolve and install as a library
- [x] JSON Schema for `cl.json` and registry items, so editors autocomplete them
- [x] `cladux build`: turn your own components into a registry, in both styles
- [x] `cladux registry validate`
- [x] Other registries in `cl.json` (`@acme/button`), with auth headers

## 0.4 - Themes and AI

- [x] Theme codes on /themes, applied with `cladux init --theme <code>` and `cladux apply <code>`
- [x] `cladux mcp`: an MCP server so AI assistants can search and add components
- [x] `llms.txt` for the docs, and a Markdown version of every page

## 0.5 - Docs and content

- [x] Docs for `@cladux/utils`: the plain-JS runtime (dialogs, tabs, toasts) and `cn`
- [x] Docs for the CSS layout helpers (`.cl-stack`, `.cl-cluster`, `.cl-grid-auto`)
- [x] Search across page content, blocks and examples
- [x] Charts page with ready-made charts
- [x] More blocks: app sidebar layouts, settings, 404, e-commerce
- [x] Right-to-left support and an RTL docs section
- [x] Open Graph images for every page

## 0.6 - Performance

Measured on the 0.5 build: every page loads about 2.9 MB of JavaScript, `next build`
spends 33 s compiling, and the CLI package is 2.5 MB.

- [ ] Load each demo only on the pages that show it. `ComponentPreview` imports all 366 demos, so every page ships them all (a 1.5 MB chunk with Tiptap, Vaul, input-otp...)
- [ ] The same for blocks and charts: `/view/<name>` and `/charts` import every one
- [ ] A budget in CI: fail the build when a page's JavaScript or a package grows past its limit
- [ ] Faster builds: highlight code with one shared Shiki instance, and cache highlighted code and the generated files between builds
- [ ] `pnpm dev` starts without regenerating what hasn't changed, and the registry rebuilds on save
- [ ] Keep Turborepo's cache small: the site's 300 MB `.next` is cached on every build and never cleaned up (19 GB after a few weeks), so cache only package builds and add `pnpm clean`
- [ ] Smaller CLI: minify the bundle, and load the MCP SDK (1.4 MB) and the css-style converter (890 KB) as dependencies instead of bundling them, so no file is over 500 KB

## 0.7 - Testing and accessibility

- [ ] Tests for `cladux-registry` (resolving, theme codes, validation), run in CI
- [ ] Tests for the plain HTML runtime: dialogs, menus, tabs and toasts in a real browser
- [ ] End-to-end tests of the site in CI with Playwright: search, the theme customizer, copy buttons, the CLI against a fresh Next.js and Vite app
- [ ] Accessibility checks (axe) on every docs page and block, in CI
- [ ] Screenshots of every component in both styles, light and dark, left to right and right to left, compared on each pull request
- [ ] Check that the Tailwind and plain CSS versions of each component still look the same

## 0.8 - Plain HTML, everywhere

- [ ] Versioned CDN files: publish `cl.css` and `cl.js` to npm, so jsDelivr and unpkg serve them by version
- [ ] Plain HTML versions of more components: accordion, sheet, slider, combobox and carousel
- [ ] A per-component CSS build, so a page loads only the components it uses
- [ ] An ES module build of the runtime, for bundlers and frameworks without React

## Component ideas

For after 0.6:

- [ ] Contribution graph: a year of activity as a grid of days, like GitHub's
- [ ] Image Cropper, with zoom, aspect ratios and an exported image
- [ ] Mention input: a textarea that suggests people after @
- [ ] QR Code, drawn as SVG in the theme's colors
- [ ] Masonry grid

## Always

- [ ] Keep up with the latest stable React, Next.js, Tailwind and Radix
