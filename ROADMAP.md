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
- [ ] Publish `cladux-ui` to npm
- [x] GitHub Actions: typecheck, build and format check on every push

## 0.2 - CLI essentials

- [ ] `add --dry-run`, `--diff`, `--view`, `--path`, `--silent`
- [ ] `cladux list`: components and blocks, the new ones marked
- [ ] `cladux search <query>`
- [ ] `cladux view <name>`: an item's files without installing it
- [ ] `cladux info`: style, aliases, installed items, versions
- [ ] `cladux docs <name>`: usage and props in the terminal
- [ ] `cladux diff`: what changed upstream since you added a component
- [ ] `cladux update`: pull upstream changes without losing your edits
- [ ] Vitest tests for every command

## 0.3 - Registry

- [ ] `@cladux/registry`: fetch, resolve and install as a library
- [ ] JSON Schema for `cl.json` and registry items, so editors autocomplete them
- [ ] `cladux build`: turn your own components into a registry, in both styles
- [ ] `cladux registry validate`
- [ ] Other registries in `cl.json` (`@acme/button`), with auth headers

## 0.4 - Themes and AI

- [ ] Theme codes on /themes, applied with `cladux init --theme <code>` and `cladux apply <code>`
- [ ] `cladux mcp`: an MCP server so AI assistants can search and add components
- [ ] `llms.txt` for the docs

## 0.5 - Docs and content

- [ ] Docs for `@cladux/utils`: the plain-JS runtime (dialogs, tabs, toasts) and `cn`
- [ ] Docs for the CSS layout helpers (`.cl-stack`, `.cl-cluster`, `.cl-grid-auto`)
- [ ] Search across page content, blocks and examples
- [ ] Charts page with ready-made charts
- [ ] More blocks: app sidebar layouts, settings, 404, e-commerce
- [ ] Right-to-left support and an RTL docs section
- [ ] Open Graph images for every page

## Always

- [ ] The parity, behavior and end-to-end tests from the full-scale test, in CI
- [ ] Accessibility checks (axe) on the docs pages
- [ ] Keep up with the latest stable React, Next.js, Tailwind and Radix
