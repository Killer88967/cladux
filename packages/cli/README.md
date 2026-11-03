# cladux-ui

The CLI for [Cladux](https://cladux.vercel.app): accessible React components in
shadcn/ui's look, plus the ones it leaves out. It copies components into your
project as **Tailwind classes or plain CSS files**, whichever your project uses.

## Usage

Run it in a React project (Next.js, Vite, React Router...) with an `@/*` import
alias:

```bash
npx cladux-ui@latest init
npx cladux-ui@latest add button card dialog
npx cladux-ui@latest add hero-01
```

`init` creates `cl.json`, adds the theme and the `cn()` helper, and detects
whether you use Tailwind v4. `add` copies components or blocks, with everything
they depend on, and installs their npm packages.

## Commands

### `init`

```bash
npx cladux-ui@latest init [options]
```

| Option            | What it does                            |
| ----------------- | --------------------------------------- |
| `--style <style>` | `tailwind` or `css` (default: detected) |
| `-f, --force`     | Overwrite an existing `cl.json`         |

### `add`

```bash
npx cladux-ui@latest add [names...] [options]
```

With no names, it shows a list to pick from.

| Option             | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `-a, --all`        | Add every component                                          |
| `-o, --overwrite`  | Replace files that already exist                             |
| `--dry-run`        | Show what would be added, write nothing                      |
| `--view`           | Like `--dry-run`, and print the files                        |
| `--diff`           | Like `--dry-run`, and show changes to files you already have |
| `-p, --path <dir>` | Put what you named in this folder instead                    |

### More commands

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `list`              | List every component and block                    |
| `search <query>`    | Find components and blocks by name or description |
| `view <names...>`   | Show an item's files without installing it        |
| `docs <names...>`   | Show a component's docs in the terminal           |
| `info`              | Show your setup and what's installed              |
| `diff [names...]`   | Compare your components with the registry         |
| `update [names...]` | Update components, keeping the files you changed  |

`update` keeps the files you edited unless you pass `--force`. It knows which
ones you changed from `cl-lock.json`, which the CLI writes next to `cl.json`.
Commit both.

### Options for every command

| Option             | What it does                             |
| ------------------ | ---------------------------------------- |
| `-c, --cwd <dir>`  | Project folder (default: current folder) |
| `-y, --yes`        | No questions                             |
| `-s, --silent`     | No output (implies `--yes`)              |
| `--registry <url>` | Use another registry URL or folder       |
| `--skip-install`   | Don't install npm packages               |
| `-v, --version`    | Show the version                         |

See the [CLI docs](https://cladux.vercel.app/docs/cli) for more.

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
