# Cladux

[![npm version](https://img.shields.io/npm/v/cladux-ui?style=for-the-badge&logo=npm&logoColor=white&color=18181b&labelColor=18181b)](https://www.npmjs.com/package/cladux-ui)
[![npm downloads](https://img.shields.io/npm/dm/cladux-ui?style=for-the-badge&logo=npm&logoColor=white&color=cb3837&labelColor=18181b&label=downloads)](https://www.npmjs.com/package/cladux-ui)
[![CI](https://img.shields.io/github/actions/workflow/status/Killer88967/cladux/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&color=2ea44f&labelColor=18181b&label=CI)](https://github.com/Killer88967/cladux/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/Killer88967/cladux?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=6366f1&labelColor=18181b)](https://github.com/Killer88967/cladux/blob/main/LICENSE)
[![docs](https://img.shields.io/badge/docs-cladux.vercel.app-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white&labelColor=18181b)](https://cladux.vercel.app)

Accessible React components in shadcn/ui's look, plus the ones it leaves out.
Add them to your project as **Tailwind classes or plain CSS files**: the CLI
checks which one you use and copies in the matching code. It's yours to change.

**[Docs](https://cladux.vercel.app/docs)** ·
**[Components](https://cladux.vercel.app/docs/components)** ·
**[Blocks](https://cladux.vercel.app/blocks)** ·
**[Examples](https://cladux.vercel.app/examples)** ·
**[Themes](https://cladux.vercel.app/themes)**

> [!IMPORTANT]
> Cladux is in early development (0.x). Things may change between releases.
> The CLI isn't on npm yet; see the [roadmap](./ROADMAP.md).

## Why Cladux

- **Tailwind or plain CSS.** With Tailwind v4 you get Tailwind classes. Without
  it, every component comes with its own CSS file, generated from the Tailwind
  version so the two always look the same.
- **More than shadcn.** Every shadcn/ui component in the nova style, plus Kanban,
  Sortable, Tree View, Rich Text Editor, Virtual List, Color Picker, File Upload,
  Tags Input, Stepper, Tour, Marquee and more.
- **Blocks and examples.** Heroes, pricing, login screens and dashboards, added
  with one command.
- **Its own CLI.** `cladux` writes `cl.json`, never shadcn's `components.json`,
  so the two live side by side.
- **Accessible.** Keyboard support, focus handling and screen reader labels,
  including drag and drop.

## Get started

In a React project (Next.js, Vite, React Router...) with an `@/*` import alias:

```bash
npx cladux-ui@latest init
npx cladux-ui@latest add button card dialog
```

Add a block:

```bash
npx cladux-ui@latest add hero-01
```

```tsx
import { Button } from "@/components/cl/button";

export default function Page() {
  return <Button>Hello</Button>;
}
```

See [Installation](https://cladux.vercel.app/docs/installation) for the CSS
style, theming, dark mode and using Cladux with shadcn/ui.

## CLI

| Command                    | What it does                                            |
| -------------------------- | ------------------------------------------------------- |
| `cladux init`              | Creates `cl.json`, adds the theme and the `cn()` helper |
| `cladux add <names...>`    | Adds components or blocks and their dependencies        |
| `cladux list`              | Lists every component and block                         |
| `cladux search <query>`    | Finds components and blocks                             |
| `cladux view <names...>`   | Shows an item's files without installing it             |
| `cladux docs <names...>`   | Shows a component's docs in the terminal                |
| `cladux info`              | Shows your setup and what's installed                   |
| `cladux diff [names...]`   | Compares your components with the registry              |
| `cladux update [names...]` | Updates components, keeping the files you changed       |
| `cladux apply <theme>`     | Applies a theme code from the Themes page               |
| `cladux build`             | Turns your own components into a registry               |
| `cladux registry validate` | Checks a registry before you publish it                 |

See the [CLI docs](https://cladux.vercel.app/docs/cli) for every option.

## This repo

A pnpm + Turborepo monorepo.

| Path              | What's in it                                                |
| ----------------- | ----------------------------------------------------------- |
| `apps/www`        | The docs site and the registry the CLI installs from        |
| `packages/ui`     | The components (source of truth for both styles) and blocks |
| `packages/cli`    | The `cladux` CLI                                            |
| `packages/tokens` | Theme variables                                             |
| `packages/styles` | Tailwind setup, base CSS and layout utilities               |
| `packages/utils`  | `cn()` and the plain-JS runtime for HTML-only projects      |

### Develop

Needs Node 26 and pnpm.

```bash
pnpm install
pnpm build                 # tokens, CLI, registry and the site
pnpm --filter www start    # http://localhost:3000
pnpm typecheck
pnpm format
```

The registry is generated from `packages/ui` when the site builds
(`apps/www/scripts/registry.ts`), including the CSS style. Edit components in
`packages/ui/src/<name>/<name>.tsx`; never edit `public/r` by hand.

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Credits

Based on [shadcn/ui](https://ui.shadcn.com) (MIT); see
`packages/ui/LICENSE-shadcn.md`. Color palette from
[Tailwind CSS](https://tailwindcss.com) (MIT).

## License

[Apache 2.0](./LICENSE)
