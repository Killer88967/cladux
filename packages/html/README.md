# cladux-html

[Cladux](https://cladux.vercel.app) for plain HTML: accessible components in
shadcn/ui's look, as `cl-*` classes on ordinary HTML. One stylesheet and one
small script, with no React and no build step. Use it on a static page, a CMS,
or a Rails, Django or Laravel view.

## From a CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cladux-html@0.1.0/cl.css" />
<script src="https://cdn.jsdelivr.net/npm/cladux-html@0.1.0/cl.js" defer></script>
```

unpkg works the same way: `https://unpkg.com/cladux-html@0.1.0/cl.css`.

Keep the exact version in the link, so an update never changes your site
without you knowing. jsDelivr shows a [Subresource Integrity](https://www.jsdelivr.com/package/npm/cladux-html)
hash for each file, to add as `integrity="..."`.

## From npm

```bash
npm install cladux-html
```

```js
import "cladux-html/cl.css";
import "cladux-html/cl.js";
```

## What's in it

- `cl.css` (about 34 KB): the theme, a small reset, the components and the
  layout helpers.
- `cl.js` (about 10 KB, no dependencies): opens dialogs, positions popovers and
  menus, switches tabs and shows toasts. Pages without those don't need it.

```html
<button class="cl-button" data-variant="outline">Cancel</button>
```

Every component, with its markup: https://cladux.vercel.app/docs/html

## License

[Apache 2.0](./LICENSE)
