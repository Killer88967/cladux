import { MinusIcon, PlusIcon } from "lucide-react";
import { Button, ButtonGroup } from "@cladux/ui";

export default function ButtonGroupOrientation() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Media controls" className="h-fit">
      <Button variant="outline" size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Remove">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}
