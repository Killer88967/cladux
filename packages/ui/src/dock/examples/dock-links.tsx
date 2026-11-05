import { BookOpenIcon, BoxesIcon, LayoutGridIcon, PaletteIcon } from "lucide-react";
import { Dock, DockItem } from "@cladux/ui";

const links = [
  { label: "Docs", href: "/docs", icon: BookOpenIcon },
  { label: "Components", href: "/docs/components", icon: BoxesIcon },
  { label: "Themes", href: "/themes", icon: PaletteIcon },
  { label: "Blocks", href: "/blocks", icon: LayoutGridIcon },
];

export default function DockLinks() {
  return (
    <div className="flex h-48 items-end">
      <Dock>
        {links.map((link) => (
          <DockItem key={link.href} label={link.label} asChild>
            <a href={link.href}>
              <link.icon />
            </a>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
