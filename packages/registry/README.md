# cladux-registry

Fetch, resolve and check [Cladux](https://cladux.vercel.app) registries from
your own code. It's the library the Cladux CLI (`cladux-ui`) is built on, with
no runtime dependencies.

```bash
npm install cladux-registry
```

## Install items yourself

```ts
import { resolveItems, rewriteImports } from "cladux-registry";

// button and everything it needs, dependencies first.
const items = await resolveItems({ registry: "https://cladux.vercel.app/r" }, "tailwind", [
  "button",
]);

for (const item of items) {
  for (const file of item.files) {
    // Point the imports at your own folders before writing the file.
    const code = rewriteImports(file.content, {
      components: "~/ui",
      hooks: "~/hooks",
      lib: "~/lib",
      utils: "~/lib/utils",
    });
  }
}
```

Other registries work the same way, by namespace, with headers for private
ones. `${NAME}` in a header is read from the environment:

```ts
const config = {
  registry: "https://cladux.vercel.app/r",
  registries: {
    "@acme": {
      url: "https://registry.acme.dev/r",
      headers: { Authorization: "Bearer ${ACME_TOKEN}" },
    },
  },
};
await resolveItems(config, "css", ["@acme/fancy-card"]);
```

## Check a registry

```ts
import { configIssues, validateRegistry } from "cladux-registry";

const { issues } = await validateRegistry("./public/r");
for (const issue of issues) console.log(issue.level, issue.file, issue.message);

configIssues(JSON.parse(cl)); // [] when a cl.json is valid
```

## Theme codes

A theme code such as `zinc-violet-lg` names a base color, an accent and a radius. Read one, and turn it into the CSS `cladux apply` writes:

```ts
import { fetchThemes, parseThemeCode, themeCss } from "cladux-registry";

const colors = await fetchThemes("https://cladux.vercel.app/r");
const theme = parseThemeCode("zinc-violet-lg", colors);
// { base: "zinc", accent: "violet", radius: "lg" }

const css = themeCss(theme, colors, "tailwind");
```

In the browser, import them from `cladux-registry/theme`, which leaves out everything that needs Node. `fetchThemes` isn't there, so load `themes.json` with `fetch`.

## API

| Export                                                      | What it does                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `fetchIndex(registry)`                                      | A registry's `index.json`                                     |
| `fetchItem(registry, style, name)`                          | One item's files in one style                                 |
| `fetchNamed(config, style, name)`                           | One item by the name people type, `button` or `@acme/button`  |
| `fetchDocs(registry, name)`                                 | An item's docs page as Markdown                               |
| `resolveItems(config, style, names)`                        | Items and everything they need, dependencies first, each once |
| `locate(config, name)`                                      | Which registry a name comes from, with its headers filled in  |
| `rewriteImports(code, aliases)`                             | Swaps the registry's import paths for yours                   |
| `fetchThemes(registry)`                                     | The colors theme codes are made from                          |
| `parseThemeCode(code, colors)`, `themeCode(theme)`          | Reads a theme code, and writes one                            |
| `themeCss(theme, colors, style)`                            | A theme as CSS, the way `cl-tokens.css` holds it              |
| `validateRegistry(registry)`                                | Everything `cladux registry validate` checks, as a list       |
| `configIssues`, `indexIssues`, `itemIssues`, `sourceIssues` | JSON Schema checks, as sentences a person can act on          |

A registry is a URL or a folder. Errors are `RegistryError` (bad config or
access), `NotFoundError` (no such item) and `ThemeError` (a theme code that
doesn't read). The types (`RegistryItem`,
`RegistryIndex`, `RegistryConfig`...) are exported too.

## Links

- [CLI docs](https://cladux.vercel.app/docs/cli)
- [JSON schemas](https://cladux.vercel.app/schema/registry-item.json)
- [Source](https://github.com/Killer88967/cladux/tree/main/packages/registry)

## License

[Apache 2.0](./LICENSE)
