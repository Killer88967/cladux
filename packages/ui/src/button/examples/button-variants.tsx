import { SquareArrowOutUpRightIcon } from "lucide-react";
import { Button } from "@cladux/ui";

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">
        Link <SquareArrowOutUpRightIcon />
      </Button>
    </div>
  );
}
