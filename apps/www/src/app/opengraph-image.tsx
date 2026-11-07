import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Build websites faster",
    description:
      "Accessible React components you own, in Tailwind or plain CSS, with blocks, charts, themes and a CLI.",
  });
}
