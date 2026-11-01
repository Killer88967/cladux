import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { Kbd } from "@component-library/ui";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { HtmlPreview } from "@/components/html-preview";

/** Plain text of a heading, used to build its anchor id. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

const slug = (node: ReactNode) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      id={slug(children)}
      className="mt-12 mb-4 scroll-mt-20 text-xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={slug(children)} className="mt-8 mb-3 scroll-mt-20 text-lg font-semibold" {...props}>
      {children}
    </h3>
  ),
  h4: (props) => <h4 className="mt-6 mb-2 font-semibold" {...props} />,
  p: (props) => <p className="my-4 leading-7" {...props} />,
  a: (props) => <a className="font-medium text-primary underline underline-offset-4" {...props} />,
  ul: (props) => <ul className="my-4 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal space-y-1 pl-6" {...props} />,
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]" {...props} />
  ),
  pre: CodeBlock,
  table: (props) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-muted/50" {...props} />,
  tr: (props) => <tr className="border-b last:border-b-0" {...props} />,
  th: (props) => <th className="px-4 py-2 text-left font-medium whitespace-nowrap" {...props} />,
  td: (props) => <td className="px-4 py-2 align-top" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-6 border-l-2 pl-4 text-muted-foreground" {...props} />
  ),
  hr: (props) => <hr className="my-8" {...props} />,
  ComponentPreview,
  HtmlPreview,
  Kbd,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
