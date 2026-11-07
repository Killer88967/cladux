"use client";

import { ArrowLeftIcon, BookOpenIcon, LifeBuoyIcon, NewspaperIcon, SearchIcon } from "lucide-react";

import { Button } from "../button/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group/input-group";

const links = [
  { label: "Documentation", description: "Guides and API reference.", icon: BookOpenIcon },
  { label: "Blog", description: "News and updates.", icon: NewspaperIcon },
  { label: "Support", description: "Talk to our team.", icon: LifeBuoyIcon },
];

export default function NotFound01() {
  return (
    <main className="mx-auto flex min-h-[36rem] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <form role="search" className="mt-8 w-full" onSubmit={(e) => e.preventDefault()}>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput type="search" placeholder="Search the site" aria-label="Search" />
        </InputGroup>
      </form>
      <ul className="mt-8 w-full divide-y rounded-xl border text-start">
        {links.map((link) => (
          <li key={link.label}>
            <a href="#" className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border">
                <link.icon className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{link.label}</span>
                <span className="text-sm text-muted-foreground">{link.description}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="mt-8" asChild>
        <a href="/">
          <ArrowLeftIcon />
          Back to home
        </a>
      </Button>
    </main>
  );
}
