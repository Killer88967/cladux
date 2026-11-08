import type * as React from "react";

/** Next.js's Link, as a plain <a>, for the demos that use it. */
export default function Link({
  href,
  prefetch: _prefetch,
  ...props
}: Omit<React.ComponentProps<"a">, "href"> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
}) {
  return <a href={typeof href === "string" ? href : (href.pathname ?? "#")} {...props} />;
}
