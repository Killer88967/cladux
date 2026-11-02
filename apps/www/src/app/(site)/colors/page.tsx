import type { Metadata } from "next";
import { ColorPalette } from "@/components/color-palette";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Colors",
  description: "The Tailwind color palette in hex, RGB, HSL and OKLCH. Click a color to copy it.",
};

export default function ColorsPage() {
  return (
    <main>
      <PageHeader
        title="Colors"
        description="The full Tailwind palette. Click a color to copy it as a class name, a CSS variable, hex, RGB, HSL or OKLCH."
        className="pb-8 md:pb-10"
      />
      <div className="cl-container pb-20">
        <ColorPalette />
      </div>
    </main>
  );
}
