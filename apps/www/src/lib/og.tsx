import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// The Open Graph image every page shares when its link is posted: the page's
// title and description in Geist, on the site's dark background.

export const ogSize = { width: 1200, height: 630 };

// The geist package the site already uses for its fonts, read at build time.
const FONTS = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "node_modules/geist/dist/fonts/geist-sans",
);
const font = (weight: "Regular" | "SemiBold") => readFile(path.join(FONTS, `Geist-${weight}.ttf`));

export async function ogImage({
  title,
  description,
  label,
}: {
  title: string;
  description?: string;
  /** A small tag above the title, such as "Components". */
  label?: string;
}) {
  const [regular, semibold] = await Promise.all([font("Regular"), font("SemiBold")]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#fafafa",
            color: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 34, fontWeight: 600 }}>Cladux</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {label && (
          <div
            style={{ fontSize: 28, color: "#a1a1a1", textTransform: "uppercase", letterSpacing: 2 }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            fontSize: title.length > 28 ? 68 : 84,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 34, color: "#a1a1a1", lineHeight: 1.35, maxWidth: 980 }}>
            {description}
          </div>
        )}
      </div>

      <div style={{ display: "flex", fontSize: 26, color: "#737373" }}>cladux.vercel.app</div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
