"use client";

import * as React from "react";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from "@cladux/ui";

export function CollapsibleSettings() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="mx-auto w-full max-w-xs" size="sm">
      <CardHeader>
        <CardTitle>Radius</CardTitle>
        <CardDescription>Set the corner radius of the element.</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex items-start gap-2">
          <FieldGroup className="grid w-full grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="radius-top-left" className="sr-only">
                Top left radius
              </FieldLabel>
              <Input id="radius-top-left" placeholder="0" defaultValue={0} />
            </Field>
            <Field>
              <FieldLabel htmlFor="radius-top-right" className="sr-only">
                Top right radius
              </FieldLabel>
              <Input id="radius-top-right" placeholder="0" defaultValue={0} />
            </Field>
            <CollapsibleContent className="col-span-full grid grid-cols-subgrid gap-2">
              <Field>
                <FieldLabel htmlFor="radius-bottom-left" className="sr-only">
                  Bottom left radius
                </FieldLabel>
                <Input id="radius-bottom-left" placeholder="0" defaultValue={0} />
              </Field>
              <Field>
                <FieldLabel htmlFor="radius-bottom-right" className="sr-only">
                  Bottom right radius
                </FieldLabel>
                <Input id="radius-bottom-right" placeholder="0" defaultValue={0} />
              </Field>
            </CollapsibleContent>
          </FieldGroup>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon" aria-label={isOpen ? "Collapse" : "Expand"}>
              {isOpen ? <MinimizeIcon /> : <MaximizeIcon />}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
