import { examplePaths } from "./examples.generated";

/** Every demo in packages/ui/src/\<component>/examples; its file, from the repo root. */
export const exampleFiles: Record<string, string> = Object.fromEntries(
  Object.entries(examplePaths).map(([name, path]) => [name, `packages/ui/src/${path}.tsx`]),
);
