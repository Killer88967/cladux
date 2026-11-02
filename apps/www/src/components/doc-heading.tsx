import type { ComponentProps, ReactNode } from "react";

/** Plain text of a heading, used to build its anchor id. */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

export const headingId = (node: ReactNode) =>
  textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function DocH2({ children, id, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      id={id ?? headingId(children)}
      className="mt-12 mb-4 scroll-mt-20 text-xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  );
}

export function DocH3({ children, id, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      id={id ?? headingId(children)}
      className="mt-8 mb-3 scroll-mt-20 text-lg font-semibold"
      {...props}
    >
      {children}
    </h3>
  );
}
