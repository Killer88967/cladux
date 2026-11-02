"use client";

import * as React from "react";
import { Label, PasswordInput, PasswordStrength, type PasswordRule } from "@cladux/ui";

const rules: PasswordRule[] = [
  { label: "At least 12 characters", test: (p) => p.length >= 12 },
  {
    label: "Not a common password",
    test: (p) => !["password", "123456"].includes(p.toLowerCase()),
  },
  { label: "No spaces", test: (p) => p.length > 0 && !/\s/.test(p) },
];

export default function PasswordInputRules() {
  const [password, setPassword] = React.useState("");

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="password-input-rules">Passphrase</Label>
      <PasswordInput
        id="password-input-rules"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrength value={password} rules={rules} />
    </div>
  );
}
