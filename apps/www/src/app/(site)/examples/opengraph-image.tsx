import { ogImage, ogSize } from "@/lib/og";

export const alt = "Cladux examples";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Examples",
    description: "Dashboards, mail, tasks and settings screens, built from Cladux components.",
  });
}
