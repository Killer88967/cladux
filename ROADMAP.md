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

Measured on the 0.5 build: every page loaded about 2.9 MB of JavaScript, `next build`
spent 33 s compiling, and the CLI package was 2.4 MB. After 0.6: docs pages load 880 KB
(267 KB gzipped), a rebuild takes about 12 s, and the CLI is 1.1 MB.

- [x] Load each demo only on the pages that show it. `ComponentPreview` imports all 366 demos, so every page ships them all (a 1.5 MB chunk with Tiptap, Vaul, input-otp...)
- [x] The same for blocks and charts: `/view/<name>` and `/charts` import every one
- [x] A budget in CI: fail the build when a page's JavaScript or a package grows past its limit
- [x] Faster builds: highlight code with one shared Shiki instance, and cache highlighted code and the generated files between builds
- [x] `pnpm dev` starts without regenerating what hasn't changed, and the registry rebuilds on save
- [x] Keep Turborepo's cache small: the site's 300 MB `.next` is cached on every build and never cleaned up (19 GB after a few weeks), so cache only package builds and add `pnpm clean`
- [x] Smaller CLI: minify the bundle, and load the MCP SDK (1.4 MB) and the css-style converter (890 KB) as dependencies instead of bundling them, so no file is over 500 KB

## 0.7 - Testing and accessibility

- [x] Tests for `cladux-registry` (resolving, theme codes, validation), run in CI
- [x] Tests for the plain HTML runtime: dialogs, menus, tabs and toasts in a real browser
- [x] End-to-end tests of the site in CI with Playwright: search, the theme customizer, copy buttons, the CLI against a fresh Next.js and Vite app
- [x] Accessibility checks (axe) on every docs page and block, in CI
- [x] Screenshots of every component in both styles, light and dark, left to right and right to left, compared on each pull request
- [x] Check that the Tailwind and plain CSS versions of each component still look the same

## 0.8 - Plain HTML, everywhere

- [x] Versioned CDN files: publish `cl.css` and `cl.js` to npm, so jsDelivr and unpkg serve them by version
- [x] Plain HTML versions of more components: accordion, sheet, slider, combobox and carousel
- [x] A per-component CSS build, so a page loads only the components it uses
- [x] An ES module build of the runtime, for bundlers and frameworks without React

## 0.9 - Every browser

- [x] Run the plain HTML runtime tests in WebKit and Firefox in CI, not just Chromium, so Safari bugs show up before a push
- [ ] Field spacing in the plain CSS style (label-to-control and field-to-field gaps), which also affects radio groups and date pickers
- [ ] Combobox input stretches to full width in the plain CSS style
- [ ] Mention Input text stays 16px in the plain CSS style
- [ ] Decide on the shadcn palette contrast (muted text on muted, destructive tint)
- [ ] Fix the known differences between the Tailwind and plain CSS styles, or write down why each one stays

## 0.10 - More plain HTML

- [ ] Alert Dialog, Drawer and Hover Card, built on the dialog and popover code
- [ ] Radio Group, Toggle Group, Progress, Avatar and Alert
- [ ] Context Menu and Menubar, built on the dropdown menu
- [ ] Select: a custom one, with the Combobox's keyboard handling

## 0.11 - Themes and design tokens

- [ ] Export a theme as design tokens (the W3C JSON format), for Figma and other tools
- [ ] Radius, font and shadow on /themes, not just colors
- [ ] More preset themes, and `cladux theme` to switch between them

## 0.12 - Docs to try things in

- [ ] A props playground on each component page: change the variant, size or state and see the code change
- [ ] A "Copy for AI" button on each page, with its Markdown version
- [ ] More blocks: dashboards, sign-in flows and marketing sections

## 1.0 - Stable

- [ ] A versioning policy: what counts as a breaking change for the components, the CLI and `cladux-html`
- [ ] `cladux migrate`: move a shadcn project to Cladux
- [ ] A pass through every docs page and README, then the 1.0 releases

## After 1.0

- [ ] Web Components versions of the plain HTML components, such as `<cl-dialog>`
- [ ] Vue or Svelte versions

## Component ideas

For after 0.6:

- [x] Contribution graph: a year of activity as a grid of days, like GitHub's
- [x] Image Cropper, with zoom, aspect ratios and an exported image
- [x] Mention input: a textarea that suggests people after @
- [x] QR Code, drawn as SVG in the theme's colors
- [x] Masonry grid

## Always

- [ ] Keep up with the latest stable React, Next.js, Tailwind and Radix
