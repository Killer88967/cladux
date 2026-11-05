# cladux-registry

## 0.2.0

### Minor Changes

- 781107e: Theme codes. Pick a theme on https://cladux.vercel.app/themes and apply its code with `cladux apply zinc-violet`, or start with one: `cladux init --theme zinc-violet`. The code is saved in `cl.json`. `cladux-registry` reads theme codes and turns them into CSS, with a browser-safe `cladux-registry/theme` entry.

## 0.1.0

### Minor Changes

- 3bdd1a1: Your own registries. `cladux build` turns your components into a registry, in both the Tailwind and the plain-CSS style. `cladux registry validate` checks one before you publish it. `registries` in `cl.json` installs from other registries (`cladux add @acme/button`), with headers for private ones. `cl.json`, registry items and `cl-registry.json` have JSON schemas, and every command checks `cl.json` first. The registry code is its own package now, `cladux-registry`.
