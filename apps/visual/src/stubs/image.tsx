import type * as React from "react";

/** Next.js's Image, as a plain <img>, for the demos that use it. */
export default function Image({
  src,
  fill,
  priority: _priority,
  quality: _quality,
  style,
  ...props
}: Omit<React.ComponentProps<"img">, "src"> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  quality?: number;
}) {
  return (
    <img
      src={typeof src === "string" ? src : src.src}
      style={
        fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style
      }
      {...props}
    />
  );
}
