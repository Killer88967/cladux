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
- [ ] Right-to-left support and an RTL docs section
- [ ] Open Graph images for every page

## Component ideas

For after 0.4:

- [x] Number Ticker: numbers that count up or roll to a new value, for Stat and dashboards
- [x] Image Compare: a before and after slider
- [x] Date Range Picker with presets (last 7 days, this month)
- [x] Dock: a macOS-style bar of icons that grow under the pointer
- [x] Signature Pad: draw a signature and export it as an image
- [x] Animated Text: more effects

## Always

- [ ] The parity, behavior and end-to-end tests from the full-scale test, in CI
- [ ] Accessibility checks (axe) on the docs pages
- [ ] Keep up with the latest stable React, Next.js, Tailwind and Radix
