# cladux-ui

## 0.3.0

### Minor Changes

- 3bdd1a1: Your own registries. `cladux build` turns your components into a registry, in both the Tailwind and the plain-CSS style. `cladux registry validate` checks one before you publish it. `registries` in `cl.json` installs from other registries (`cladux add @acme/button`), with headers for private ones. `cl.json`, registry items and `cl-registry.json` have JSON schemas, and every command checks `cl.json` first. The registry code is its own package now, `cladux-registry`.

## 0.2.0

### Minor Changes

- 8ee53eb: New commands: `list`, `search`, `view`, `docs`, `info`, `diff` and `update`. `update` brings components up to date and keeps the files you changed, using fingerprints the CLI now saves in `cl-lock.json`. `add` gets `--dry-run`, `--view`, `--diff` and `--path`, and every command takes `--silent`. `list` marks new components, and `-v` prints the version.

## 0.1.1

### Patch Changes

- 5d609fd: Release through CI

## 0.1.0

### Minor Changes

- First release. `cladux init` sets up a React project for Cladux in the Tailwind or the plain CSS style, and `cladux add` copies components and blocks into it with everything they depend on.
