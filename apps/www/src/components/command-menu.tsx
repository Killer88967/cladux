"use client";

import { AppWindowIcon, FileTextIcon, HashIcon, LayoutGridIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  KbdGroup,
} from "@cladux/ui";
import type { NavGroup } from "@/lib/docs";
import { search, type SearchEntry } from "@/lib/search";

/** public/search.json, written by scripts/search.ts. Loaded once, the first time it's needed. */
let index: Promise<SearchEntry[]> | undefined;
const loadIndex = () =>
  (index ??= fetch("/search.json")
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => {
      index = undefined;
      return [];
    }));

const icon = (entry: SearchEntry) =>
  entry.parent ? (
    <HashIcon />
  ) : entry.group === "Blocks" ? (
    <LayoutGridIcon />
  ) : entry.group === "Examples" ? (
    <AppWindowIcon />
  ) : (
    <FileTextIcon />
  );

/** Results under their group's heading, groups in the order their best result came. */
function grouped(results: SearchEntry[]) {
  const groups = new Map<string, SearchEntry[]>();
  for (const entry of results) groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
  return [...groups];
}

export function CommandMenu({ nav }: { nav: NavGroup[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [entries, setEntries] = React.useState<SearchEntry[] | null>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing =
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));

      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Load the index when the search opens. Hovering the button starts it early.
  React.useEffect(() => {
    if (open && !entries) void loadIndex().then(setEntries);
  }, [open, entries]);

  const results = React.useMemo(() => search(entries ?? [], query), [entries, query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start bg-muted/50 font-normal text-muted-foreground shadow-none sm:w-56"
        onClick={() => setOpen(true)}
        onPointerEnter={() => void loadIndex()}
      >
        Search documentation...
        <KbdGroup className="ml-auto hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search pages, sections, blocks and examples"
      >
        {/* Our own search ranks the results, so cmdk shows them as they come. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages, sections, blocks..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() ? (
              <>
                <CommandEmpty>
                  {entries ? `No results for "${query.trim()}".` : "Loading…"}
                </CommandEmpty>
                {grouped(results).map(([group, items]) => (
                  <CommandGroup key={group} heading={group}>
                    {items.map((entry) => {
                      const detail = [entry.parent, entry.text].filter(Boolean).join(" · ");
                      return (
                        <CommandItem
                          key={entry.href}
                          value={entry.href}
                          onSelect={() => go(entry.href)}
                        >
                          {icon(entry)}
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate">{entry.title}</span>
                            {detail && (
                              <span className="truncate text-xs text-muted-foreground">
                                {detail}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
              </>
            ) : (
              // Nothing typed yet: the docs, like the sidebar.
              nav.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((item) => (
                    <CommandItem key={item.href} value={item.href} onSelect={() => go(item.href)}>
                      <FileTextIcon />
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
