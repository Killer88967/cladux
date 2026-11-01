import { Input, Label } from "@cladux/ui";

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="input-demo-email">Email</Label>
      <Input id="input-demo-email" type="email" placeholder="you@example.com" />
    </div>
  );
}
