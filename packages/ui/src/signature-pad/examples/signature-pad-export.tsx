"use client";

import * as React from "react";
import { Button, SignaturePad, type SignaturePadHandle } from "@cladux/ui";

export default function SignaturePadExport() {
  const pad = React.useRef<SignaturePadHandle>(null);
  const [png, setPng] = React.useState<string | null>(null);

  const downloadSvg = () => {
    const svg = pad.current?.toSVG();
    if (!svg) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    link.download = "signature.svg";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <SignaturePad ref={pad} color="#1d4ed8" strokeWidth={3} onValueChange={setPng} />
      <div className="flex items-center gap-3">
        <div className="flex h-12 flex-1 items-center rounded-md border border-dashed px-2">
          {png ? (
            <img src={png} alt="Your signature" className="max-h-10" />
          ) : (
            <span className="text-sm text-muted-foreground">The PNG shows here</span>
          )}
        </div>
        <Button variant="outline" disabled={!png} onClick={downloadSvg}>
          Download SVG
        </Button>
      </div>
    </div>
  );
}
