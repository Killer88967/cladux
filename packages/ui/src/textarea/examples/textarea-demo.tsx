import { Label, Textarea } from "@cladux/ui";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="textarea-demo-message">Your message</Label>
      <Textarea id="textarea-demo-message" placeholder="Type your message here." />
    </div>
  );
}
