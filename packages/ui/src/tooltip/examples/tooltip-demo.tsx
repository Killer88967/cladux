import { Button, Kbd, Tooltip, TooltipContent, TooltipTrigger } from "@cladux/ui";

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover</Button>
      </TooltipTrigger>
      <TooltipContent>
        Add to library <Kbd>⌘ D</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
