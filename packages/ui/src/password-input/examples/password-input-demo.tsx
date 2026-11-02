import { Label, PasswordInput } from "@cladux/ui";

export default function PasswordInputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="password-input-demo">Password</Label>
      <PasswordInput id="password-input-demo" placeholder="Enter your password" />
    </div>
  );
}
