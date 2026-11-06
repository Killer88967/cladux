"use client";

import * as React from "react";
import { Button, Input, Label, SignaturePad } from "@cladux/ui";

export default function SignaturePadForm() {
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const signature = String(data.get("signature"));
        setSent(
          signature
            ? `${data.get("name")} signed (${Math.round(signature.length / 1024)} KB PNG)`
            : "Sign first",
        );
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="signer">Full name</Label>
        <Input id="signer" name="name" defaultValue="Ada Lovelace" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Signature</Label>
        <SignaturePad name="signature" placeholder="Sign with your mouse or finger" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Submit</Button>
        {sent && <span className="text-sm text-muted-foreground">{sent}</span>}
      </div>
    </form>
  );
}
