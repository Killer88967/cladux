"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@cladux/ui";
import { CopyButton } from "@/components/copy-button";

// TODO: Rename when I come up with a name before publish (if published)
const CLI = "cladux@latest";

const MANAGERS = ["npm", "pnpm", "bun", "yarn"] as const;
type Manager = (typeof MANAGERS)[number];

const RUN: Record<Manager, string> = {
  npm: "npx",
  pnpm: "pnpx",
  bun: "bunx --bun",
  yarn: "yarn dlx",
};
const ADD: Record<Manager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  bun: "bun add",
  yarn: "yarn add",
};

const STORAGE_KEY = "cl-package-manager";
const EVENT = "cl-package-manager";

function usePackageManager() {
  const [manager, setManager] = React.useState<Manager>("npm");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (MANAGERS as readonly string[]).includes(saved)) setManager(saved as Manager);
    } catch {
      // Storage can be unavailable (private mode).
    }
    const sync = (e: Event) => setManager((e as CustomEvent<Manager>).detail);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const choose = (next: Manager) => {
    setManager(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  };

  return [manager, choose] as const;
}

interface CliCommandProps {
  args?: string;
  packages?: string;
}

export function CliCommand({ args, packages }: CliCommandProps) {
  const [manager, setManager] = usePackageManager();
  const command = packages ? `${ADD[manager]} ${packages}` : `${RUN[manager]} ${CLI} ${args ?? ""}`;

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-muted/50">
      <Tabs value={manager} onValueChange={(v) => setManager(v as Manager)} className="gap-0">
        <TabsList variant="line" className="h-10 w-full justify-start border-b px-2">
          {MANAGERS.map((m) => (
            <TabsTrigger key={m} value={m} className="flex-none px-2 font-mono text-sm">
              {m}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative">
        <pre className="overflow-x-auto p-4 pr-12 font-mono text-sm leading-relaxed">
          <code>{command.trim()}</code>
        </pre>
        <CopyButton value={command.trim()} className="absolute top-2.5 right-2" />
      </div>
    </div>
  );
}
