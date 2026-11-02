"use client";

import * as React from "react";

import { Button } from "../button/button";
import { Input } from "../input/input";
import { Separator } from "../separator/separator";

const columns = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Docs", "Guides", "API", "Status"],
};

export default function Footer01() {
  const [joined, setJoined] = React.useState(false);
  return (
    <footer className="border-t px-4 pt-14 pb-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-sm">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
              A
            </span>
            Acme
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            One product update a month. No spam, unsubscribe any time.
          </p>
          {joined ? (
            <p className="mt-4 text-sm font-medium">You&apos;re subscribed. Thanks!</p>
          ) : (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setJoined(true);
              }}
            >
              <Input type="email" required placeholder="you@example.com" aria-label="Email" />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>
        {Object.entries(columns).map(([title, links]) => (
          <div key={title}>
            <h3 className="text-sm font-medium">{title}</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator className="mx-auto my-8 max-w-6xl" />
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>© 2026 Acme Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
