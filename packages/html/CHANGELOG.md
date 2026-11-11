# cladux-html

## 0.3.0

### Minor Changes

- 2b92f58: Add an ES module build of the script, `cl.mjs`, with types, for bundlers and `<script type="module">`: `import { start, toast } from "cladux-html"`.
- 6846154: Ship each component's CSS as its own file, `components/<name>.css`, plus `core.css` with the theme, base styles and layout helpers, so a page can load only the components it uses.

## 0.2.0

### Minor Changes

- 1930f7b: Add a CSS-only Accordion built on native `<details>`.
- dd47a6f: Add a CSS-only Carousel: scroll snapping, with buttons, arrow keys and mouse dragging from the script.
- 4f294ff: Add a CSS-only Combobox: a text input that filters a list as you type.
- 151d319: Add a CSS-only Sheet: a `<dialog>` that slides in from any edge.
- c086060: Add a CSS-only Slider: a native range input, with the track filled up to the thumb.

### Patch Changes

- d10cc7a: Fix the Dialog filling the whole height of the screen in Safari.
