import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Banner, BannerClose, BannerContent, BannerDescription, BannerTitle } from "@cladux/ui";

export default function BannerDemo() {
  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <Banner>
        <BannerContent>
          <SparklesIcon className="size-4 self-center" />
          <BannerTitle>Cladux 2.1 is out.</BannerTitle>
          <BannerDescription>
            Tree View, Stepper and Timeline are here.{" "}
            <a href="#">
              Read the changelog <ArrowRightIcon className="inline size-3.5" />
            </a>
          </BannerDescription>
        </BannerContent>
        <BannerClose />
      </Banner>
      <div className="h-24 bg-muted/30" />
    </div>
  );
}
