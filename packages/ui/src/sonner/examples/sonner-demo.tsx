"use client";

import { toast } from "sonner";
import { Button } from "@cladux/ui";

export default function SonnerDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2026 at 9:00 AM",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      >
        Show toast
      </Button>
      <Button variant="outline" onClick={() => toast.success("Changes saved")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
        Error
      </Button>
    </div>
  );
}
