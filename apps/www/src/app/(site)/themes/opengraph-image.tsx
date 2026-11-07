import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux themes";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Themes",
    description: "Pick a base color, an accent and a radius, then apply it with one theme code.",
  });
}
