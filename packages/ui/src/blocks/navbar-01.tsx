"use client";

import { MenuIcon } from "lucide-react";
import * as React from "react";

import { Button } from "../button/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet/sheet";

const links = ["Product", "Solutions", "Pricing", "Docs", "Blog"];

export default function Navbar01() {
  const [open, setOpen] = React.useState(false);
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            A
          </span>
          Acme
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="ms-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost">Sign in</Button>
          <Button>Get started</Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ms-auto md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Acme</SheetTitle>
              <SheetDescription className="sr-only">Navigation</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-1 px-4">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="rounded-md px-2 py-2 hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {link}
                </a>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 p-4">
              <Button variant="outline">Sign in</Button>
              <Button>Get started</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
