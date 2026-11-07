---
"cladux-ui": patch
---

A smaller package: the CLI is minified and leaves out Zod's translations, which it never used. It's 1.1 MB unpacked instead of 2.4 MB, and the `npx` download is about 300 KB.
