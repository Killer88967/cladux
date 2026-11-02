import { InfoIcon, TriangleAlertIcon, XCircleIcon } from "lucide-react";
import {
  Banner,
  BannerActions,
  BannerClose,
  BannerContent,
  BannerDescription,
  BannerTitle,
  Button,
} from "@cladux/ui";

export default function BannerVariants() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Banner variant="primary" className="rounded-lg">
        <BannerContent>
          <BannerTitle>Black Friday</BannerTitle>
          <BannerDescription>40% off every plan until Monday.</BannerDescription>
        </BannerContent>
        <BannerActions>
          <Button size="sm" variant="secondary">
            Upgrade
          </Button>
        </BannerActions>
        <BannerClose />
      </Banner>
      <Banner variant="muted" className="rounded-lg border">
        <InfoIcon />
        <BannerContent className="sm:justify-start">
          <BannerDescription>
            Scheduled maintenance on Sunday from 2:00 to 3:00 UTC.
          </BannerDescription>
        </BannerContent>
      </Banner>
      <Banner variant="warning" className="rounded-lg border">
        <TriangleAlertIcon />
        <BannerContent className="sm:justify-start">
          <BannerTitle>Your trial ends in 3 days.</BannerTitle>
        </BannerContent>
        <BannerActions>
          <Button size="sm" variant="outline">
            Add payment method
          </Button>
        </BannerActions>
      </Banner>
      <Banner variant="destructive" className="rounded-lg border">
        <XCircleIcon />
        <BannerContent className="sm:justify-start">
          <BannerTitle>Payment failed.</BannerTitle>
          <BannerDescription>Update your card to keep your workspace.</BannerDescription>
        </BannerContent>
        <BannerClose />
      </Banner>
    </div>
  );
}
