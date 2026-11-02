# cladux

The CLI for [Cladux](https://cladux.vercel.app): accessible React components in
shadcn/ui's look, plus the ones it leaves out. It copies components into your
project as **Tailwind classes or plain CSS files**, whichever your project uses.

## Usage

Run it in a React project (Next.js, Vite, React Router...) with an `@/*` import
alias:

```bash
npx cladux@latest init
npx cladux@latest add button card dialog
npx cladux@latest add hero-01
```

`init` creates `cl.json`, adds the theme and the `cn()` helper, and detects
whether you use Tailwind v4. `add` copies components or blocks, with everything
they depend on, and installs their npm packages.

## Commands

### `init`

```bash
npx cladux@latest init [options]
```

| Option             | What it does                                |
| ------------------ | ------------------------------------------- |
| `--style <style>`  | `tailwind` or `css` (default: detected)     |
| `--registry <url>` | Install from another registry URL or folder |
| `-f, --force`      | Overwrite an existing `cl.json`             |
| `-y, --yes`        | Use the defaults, no questions              |
| `-c, --cwd <dir>`  | Project folder (default: current folder)    |
| `--skip-install`   | Don't install npm packages                  |

### `add`

```bash
npx cladux@latest add [names...] [options]
```

With no names, it shows a list to pick from.

| Option            | What it does                             |
| ----------------- | ---------------------------------------- |
| `-a, --all`       | Add every component                      |
| `-o, --overwrite` | Replace files that already exist         |
| `-y, --yes`       | No questions                             |
| `-c, --cwd <dir>` | Project folder (default: current folder) |
| `--skip-install`  | Don't install npm packages               |

## Works with shadcn/ui

Cladux writes `cl.json` and installs to `components/cl` by default, so it never
touches shadcn's `components.json` or `components/ui`.

## Links

- [Docs](https://cladux.vercel.app/docs)
- [Components](https://cladux.vercel.app/docs/components)
- [Blocks](https://cladux.vercel.app/blocks)
- [Source](https://github.com/Killer88967/cladux)

## License

[Apache 2.0](./LICENSE)
