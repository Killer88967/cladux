import * as React from "react";
import { encode } from "uqr";
import { cn } from "@cladux/utils";

interface QrCodeProps extends Omit<React.ComponentProps<"svg">, "children"> {
  /** The text or URL in the code. */
  value: string;
  /** Width and height, in pixels or any CSS length. */
  size?: number | string;
  /** How much of the code can be covered or damaged and still scan: L 7%, M 15%, Q 25%, H 30%. */
  level?: "L" | "M" | "Q" | "H";
  /** The empty border around the code, in modules (the code's squares). Scanners like 2 or more. */
  margin?: number;
  /** The shape of the squares and the three corner markers. */
  variant?: "classic" | "rounded" | "dots";
  /** An image in the middle, such as a logo. Raises `level` to H so the code still scans. */
  image?: string;
  /** The image's width, as a share of the code's. Keep it under about 0.25. */
  imageSize?: number;
  /** What screen readers say. Defaults to the value. */
  label?: string;
}

/** The three 7 × 7 corner markers, as [column, row]. */
const finders = (n: number) =>
  [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ] as const;

const inFinder = (x: number, y: number, n: number) =>
  (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

/** A rounded square as a path, so a whole code is a single <path>. */
function rect(x: number, y: number, w: number, h: number, r = 0) {
  if (!r) return `M${x} ${y}h${w}v${h}h${-w}z`;
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

/**
 * A QR code, drawn as an SVG in the text color, so it follows your theme and
 * stays sharp at any size. Renders on the server too. Square, rounded or dot
 * styles, with an optional logo in the middle.
 */
function QrCode({
  value,
  size = 160,
  level = "M",
  margin = 2,
  variant = "classic",
  image,
  imageSize = 0.22,
  label,
  className,
  style,
  ...props
}: QrCodeProps) {
  const { modules, logo, n } = React.useMemo(() => {
    const { data, size: n } = encode(value, { ecc: image ? "H" : level, border: 0 });

    // The modules under the logo, plus one around it, are left out so it sits on a clear patch.
    let logo: { x: number; size: number } | null = null;
    if (image) {
      const s = Math.round(n * Math.min(imageSize, 0.3));
      const side = s % 2 === n % 2 ? s : s + 1;
      logo = { x: (n - side) / 2, size: side };
    }
    const covered = (x: number, y: number) =>
      !!logo &&
      x >= logo.x - 1 &&
      x < logo.x + logo.size + 1 &&
      y >= logo.x - 1 &&
      y < logo.x + logo.size + 1;

    const modules: string[] = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!data[y]![x] || inFinder(x, y, n) || covered(x, y)) continue;
        if (variant === "dots") {
          modules.push(`M${x + 0.5} ${y + 0.04}a.46 .46 0 1 1 0 .92a.46 .46 0 1 1 0-.92z`);
        } else {
          // Runs of squares in a row become one rectangle: a smaller path, no hairline gaps.
          let run = 1;
          while (
            x + run < n &&
            data[y]![x + run] &&
            !inFinder(x + run, y, n) &&
            !covered(x + run, y)
          )
            run++;
          modules.push(rect(x, y, run, 1));
          x += run - 1;
        }
      }
    }
    return { modules: modules.join(""), logo, n };
  }, [value, level, image, imageSize, variant]);

  // The corner markers: a ring, and a square in the middle.
  const r = variant === "classic" ? 0 : 1;
  const markers = finders(n)
    .map(
      ([x, y]) =>
        rect(x, y, 7, 7, r * 2) +
        rect(x + 1, y + 1, 5, 5, r * 1.4) +
        rect(x + 2, y + 2, 3, 3, variant === "dots" ? 1.5 : r * 0.8),
    )
    .join("");

  const full = n + margin * 2;
  return (
    <svg
      data-slot="qr-code"
      role="img"
      aria-label={label ?? value}
      viewBox={`${-margin} ${-margin} ${full} ${full}`}
      shapeRendering={variant === "classic" ? "crispEdges" : undefined}
      className={cn("shrink-0 rounded-md bg-background text-foreground", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <path d={modules} fill="currentColor" />
      <path d={markers} fill="currentColor" fillRule="evenodd" />
      {logo && image && (
        <image
          href={image}
          x={logo.x}
          y={logo.x}
          width={logo.size}
          height={logo.size}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </svg>
  );
}

export { QrCode, type QrCodeProps };
