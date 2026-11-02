"use client";

import * as React from "react";
import {
  Banner,
  BannerClose,
  BannerContent,
  BannerDescription,
  BannerTitle,
  Button,
} from "@cladux/ui";

export default function BannerRemember() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full overflow-hidden rounded-lg border">
        <Banner key={key} variant="muted" storageKey="cladux-demo-banner">
          <BannerContent>
            <BannerTitle>We've updated our terms.</BannerTitle>
            <BannerDescription>Dismiss this and it stays hidden after a reload.</BannerDescription>
          </BannerContent>
          <BannerClose />
        </Banner>
        <div className="h-16" />
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          try {
            localStorage.removeItem("cladux-demo-banner");
          } catch {}
          setKey(key + 1);
        }}
      >
        Reset
      </Button>
    </div>
  );
}
