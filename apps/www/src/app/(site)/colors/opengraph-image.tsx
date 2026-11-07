import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux colors";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Colors",
    description: "The Tailwind color palette in hex, RGB, HSL and OKLCH.",
  });
}
