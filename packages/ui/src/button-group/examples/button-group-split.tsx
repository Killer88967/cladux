import { IconPlus } from "@tabler/icons-react";
import { Button, ButtonGroup, ButtonGroupSeparator } from "@cladux/ui";

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup>
      <Button variant="secondary">Button</Button>
      <ButtonGroupSeparator />
      <Button size="icon" variant="secondary" aria-label="Add">
        <IconPlus />
      </Button>
    </ButtonGroup>
  );
}
