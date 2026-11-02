"use client";

import * as React from "react";
import { Label, PasswordInput, PasswordStrength } from "@cladux/ui";

export default function PasswordInputStrength() {
  const [password, setPassword] = React.useState("");

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="password-input-strength">New password</Label>
      <PasswordInput
        id="password-input-strength"
        autoComplete="new-password"
        placeholder="Choose a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-describedby="password-input-strength-meter"
      />
      <PasswordStrength id="password-input-strength-meter" value={password} />
    </div>
  );
}
