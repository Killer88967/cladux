import { ItalicIcon } from "lucide-react";
import { Toggle } from "@cladux/ui";

export function ToggleText() {
  return (
    <Toggle aria-label="Toggle italic">
      <ItalicIcon />
      Italic
    </Toggle>
  );
}
