import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux charts";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Charts",
    description:
      "Area, bar, line, pie, radar and radial charts in cards, ready to add with one command.",
  });
}
