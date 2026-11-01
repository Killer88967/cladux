"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cladux/ui";

type Style = "tailwind" | "css";

const STORAGE_KEY = "cl-style";
const EVENT = "cl-style";

/**
 * Tailwind / CSS tabs for content that differs between the two styles.
 * The choice is shared by every StyleTabs on the site and remembered.
 */
export function StyleTabs({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = React.useState<Style>("tailwind");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "tailwind" || saved === "css") setStyle(saved);
    } catch {
      // Storage can be unavailable (private mode); the default is fine.
    }
    const sync = (e: Event) => setStyle((e as CustomEvent<Style>).detail);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const choose = (next: string) => {
    const value = next as Style;
    setStyle(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore: the choice still applies to this page.
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  };

  return (
    <Tabs value={style} onValueChange={choose} className="my-6 gap-0">
      <TabsList variant="line" className="mb-2">
        <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

/** One style's content inside StyleTabs. */
export function StyleTab({ value, children }: { value: Style; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="[&>*:first-child]:mt-2">
      {children}
    </TabsContent>
  );
}
