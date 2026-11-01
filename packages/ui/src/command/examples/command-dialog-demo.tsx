"use client";

import { CalendarIcon, SettingsIcon, SmileIcon, UserIcon } from "lucide-react";
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
  CommandShortcut,
} from "@cladux/ui";

export default function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <CalendarIcon />
                Calendar
              </CommandItem>
              <CommandItem>
                <SmileIcon />
                Search Emoji
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem>
                <UserIcon />
                Profile
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <SettingsIcon />
                Settings
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
