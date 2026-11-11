# cladux-html

[Cladux](https://cladux.vercel.app) for plain HTML: accessible components in
shadcn/ui's look, as `cl-*` classes on ordinary HTML. One stylesheet (or just
the components you use) and one small script, with no React and no build step.
Use it on a static page, a CMS, or a Rails, Django or Laravel view.

## From a CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cladux-html@0.3.0/cl.min.css" />
<script src="https://cdn.jsdelivr.net/npm/cladux-html@0.3.0/cl.min.js" defer></script>
```

unpkg works the same way: `https://unpkg.com/cladux-html@0.3.0/cl.min.css`.

Keep the exact version in the link, so an update never changes your site
without you knowing. jsDelivr shows a [Subresource Integrity](https://www.jsdelivr.com/package/npm/cladux-html)
hash for each file, to add as `integrity="..."`.

## From npm

```bash
npm install cladux-html
```

```js
import "cladux-html/cl.css";
import { start, toast } from "cladux-html";

start();
toast.success("Changes saved");
```

`cladux-html` is an ES module with TypeScript types. It starts nothing until
you call `start()`, and adds no global.

## What's in it

- `cl.min.css` (about 8 KB gzipped): the theme, a small reset, the components
  and the layout helpers.
- `cl.min.js` (about 7 KB gzipped, no dependencies): opens dialogs and sheets,
  positions popovers and menus, switches tabs, filters comboboxes, moves
  carousels and shows toasts. Pages without those don't need it.
- `core.min.css` and `components/<name>.min.css`: the same CSS split up, so a
  page can load the theme and only the components it uses.
- `cl.min.mjs`: the script as an ES module, with types in `types/`.
- Readable versions of each, without `.min`, for looking inside or debugging.

```html
<button class="cl-button" data-variant="outline">Cancel</button>
```

Every component, with its markup: https://cladux.vercel.app/docs/html

## License

[Apache 2.0](./LICENSE)
