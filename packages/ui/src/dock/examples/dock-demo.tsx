import {
  CalendarIcon,
  HomeIcon,
  MailIcon,
  MusicIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";
import { Dock, DockItem, DockSeparator } from "@cladux/ui";

export default function DockDemo() {
  return (
    <div className="flex h-48 items-end">
      <Dock>
        <DockItem label="Home">
          <HomeIcon />
        </DockItem>
        <DockItem label="Search">
          <SearchIcon />
        </DockItem>
        <DockItem label="Mail" active>
          <MailIcon />
        </DockItem>
        <DockItem label="Music" active>
          <MusicIcon />
        </DockItem>
        <DockItem label="Calendar">
          <CalendarIcon />
        </DockItem>
        <DockSeparator />
        <DockItem label="Settings">
          <SettingsIcon />
        </DockItem>
        <DockItem label="Trash">
          <Trash2Icon />
        </DockItem>
      </Dock>
    </div>
  );
}
