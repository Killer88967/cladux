import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Showcase } from "@/components/showcase/showcase";
import { ThemeCustomizer } from "@/components/theme-customizer";

export const metadata: Metadata = {
  title: "Themes",
  description: "Pick a base color, an accent and a radius, then copy the CSS variables.",
};

export default function ThemesPage() {
  return (
    <main>
      <PageHeader
        title="Make it yours"
        description="Pick a base color, an accent and a radius. Everything on this page follows along, in light and dark. Then copy the variables into your project."
        className="pb-8 md:pb-10"
      />
      <div className="cl-container pb-20">
        <ThemeCustomizer>
          <Showcase />
        </ThemeCustomizer>
      </div>
    </main>
  );
}
