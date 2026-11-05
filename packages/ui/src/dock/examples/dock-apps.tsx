import { CameraIcon, CloudIcon, MapIcon, MessageCircleIcon, NotebookPenIcon } from "lucide-react";
import { Dock, DockItem } from "@cladux/ui";

const apps = [
  { label: "Messages", icon: MessageCircleIcon, color: "from-green-400 to-green-600" },
  { label: "Maps", icon: MapIcon, color: "from-sky-400 to-blue-600" },
  { label: "Camera", icon: CameraIcon, color: "from-zinc-500 to-zinc-800" },
  { label: "Weather", icon: CloudIcon, color: "from-blue-400 to-indigo-600" },
  { label: "Notes", icon: NotebookPenIcon, color: "from-amber-300 to-orange-500" },
];

export default function DockApps() {
  return (
    <div className="flex h-56 items-end">
      <Dock size={48} magnification={2} distance={160}>
        {apps.map((app) => (
          <DockItem
            key={app.label}
            label={app.label}
            className={`bg-linear-to-b text-white hover:opacity-90 ${app.color}`}
          >
            <app.icon />
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
