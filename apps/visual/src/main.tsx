import "@style";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@cladux/ui";

// Every demo in packages/ui/src/<component>/examples, by file name.
type Demo = Record<string, unknown> & { default?: React.ComponentType };
const loaders = import.meta.glob<Demo>("@examples/*/examples/*.tsx");
const demos = Object.fromEntries(
  Object.entries(loaders).map(([file, load]) => [file.split("/").pop()!.slice(0, -4), load]),
);

class Boundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      console.error(`demo crashed: ${this.state.error.message}`);
      return <pre data-error>{this.state.error.message}</pre>;
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root")!);

declare global {
  interface Window {
    __demos: string[];
    __show: (name: string) => Promise<void>;
  }
}

window.__demos = Object.keys(demos).sort();

/** Renders one demo on a plain stage, the way the docs preview shows it. */
window.__show = async (name) => {
  const load = demos[name];
  if (!load) throw new Error(`No demo called ${name}`);
  const mod = await load();
  const Component = (mod.default ??
    Object.values(mod).find((value) => typeof value === "function")) as React.ComponentType;
  await new Promise<void>((resolve) => {
    root.render(
      <TooltipProvider>
        <div
          id="stage"
          key={name}
          className="flex min-h-40 w-[720px] items-center justify-center bg-background p-8 font-sans text-foreground"
        >
          <Boundary>
            <Component />
          </Boundary>
        </div>
      </TooltipProvider>,
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
};
