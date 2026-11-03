# cladux-ui

## 0.2.0

### Minor Changes

- 8ee53eb: New commands: `list`, `search`, `view`, `docs`, `info`, `diff` and `update`. `update` brings components up to date and keeps the files you changed, using fingerprints the CLI now saves in `cl-lock.json`. `add` gets `--dry-run`, `--view`, `--diff` and `--path`, and every command takes `--silent`. `list` marks new components, and `-v` prints the version.

## 0.1.1

### Patch Changes

- 5d609fd: Release through CI

## 0.1.0

### Minor Changes

- First release. `cladux init` sets up a React project for Cladux in the Tailwind or the plain CSS style, and `cladux add` copies components and blocks into it with everything they depend on.
