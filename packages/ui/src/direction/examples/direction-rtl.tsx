"use client";

import { ArrowRightIcon, MailIcon } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DirectionProvider,
  Field,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
} from "@cladux/ui";

export default function DirectionRtl() {
  const [dir, setDir] = React.useState<"ltr" | "rtl">("rtl");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={dir}
        onValueChange={(value) => value && setDir(value as "ltr" | "rtl")}
        aria-label="Direction"
      >
        <ToggleGroupItem value="ltr">Left to right</ToggleGroupItem>
        <ToggleGroupItem value="rtl">Right to left</ToggleGroupItem>
      </ToggleGroup>

      {/* dir sets the layout; DirectionProvider tells menus, sliders and carousels. */}
      <DirectionProvider dir={dir}>
        <Card dir={dir} className="w-full">
          <CardHeader>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Email</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <CardTitle className="flex items-center gap-2">
              Newsletter <Badge variant="secondary">New</Badge>
            </CardTitle>
            <CardDescription>
              Everything mirrors: padding, icons, borders and arrows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="rtl-email">Email</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
                <InputGroupInput id="rtl-email" placeholder="you@example.com" />
              </InputGroup>
            </Field>
            <div className="flex items-center gap-2">
              <Switch id="rtl-weekly" defaultChecked />
              <Label htmlFor="rtl-weekly">Weekly digest</Label>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Subscribe
              {/* Your own direction icons need rtl:rotate-180 too. */}
              <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
            </Button>
          </CardFooter>
        </Card>
      </DirectionProvider>
    </div>
  );
}
