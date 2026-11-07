import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux blocks";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Blocks",
    description:
      "Heroes, pricing tables, login screens, app shells and shop pages, ready to add with one command.",
  });
}
