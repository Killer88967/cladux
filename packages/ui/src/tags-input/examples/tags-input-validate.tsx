"use client";

import * as React from "react";
import { Label, TagsInput } from "@cladux/ui";

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function TagsInputValidate() {
  const [emails, setEmails] = React.useState(["ada@example.com"]);
  const [error, setError] = React.useState("");

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="tags-input-validate">Invite by email</Label>
      <TagsInput
        id="tags-input-validate"
        value={emails}
        onValueChange={(next) => {
          setEmails(next);
          setError("");
        }}
        max={5}
        delimiters={[",", " ", ";"]}
        validate={(tag) => {
          const email = tag.toLowerCase();
          if (isEmail(email)) return email;
          setError(`"${tag}" isn't an email address.`);
          return false;
        }}
        aria-invalid={error ? true : undefined}
        placeholder="name@example.com"
      />
      <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {error || `${emails.length} of 5 invites. Paste a list to add several.`}
      </p>
    </div>
  );
}
