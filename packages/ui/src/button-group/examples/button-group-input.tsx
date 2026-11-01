import { SearchIcon } from "lucide-react";
import { Button, ButtonGroup, Input } from "@cladux/ui";

export default function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}
