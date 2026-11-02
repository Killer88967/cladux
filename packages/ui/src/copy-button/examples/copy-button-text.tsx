"use client";

import { toast } from "sonner";
import { CopyButton } from "@cladux/ui";

export default function CopyButtonText() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton
        variant="outline"
        value="https://cladux.dev/invite/7f3k2"
        onCopy={() => toast("Link copied")}
      >
        Copy invite link
      </CopyButton>
      <CopyButton variant="default" value={() => new Date().toISOString()}>
        Copy timestamp
      </CopyButton>
    </div>
  );
}
