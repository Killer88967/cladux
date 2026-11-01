import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@cladux/ui";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="grid grid-cols-3 items-center gap-3">
          <Label htmlFor="popover-demo-width">Width</Label>
          <Input id="popover-demo-width" defaultValue="100%" className="col-span-2" />
          <Label htmlFor="popover-demo-height">Height</Label>
          <Input id="popover-demo-height" defaultValue="25px" className="col-span-2" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
