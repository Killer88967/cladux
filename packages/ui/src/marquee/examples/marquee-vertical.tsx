import { Badge, Marquee } from "@cladux/ui";

const events = [
  "New sign-up from Berlin",
  "Order #1042 shipped",
  "Invoice paid: $240",
  "Deploy finished in 41s",
  "3 new comments",
  "Backup completed",
];

export default function MarqueeVertical() {
  return (
    <Marquee direction="up" speed={20} gap={8} className="h-48 w-64">
      {events.map((event) => (
        <div key={event} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Badge variant="secondary">Live</Badge>
          {event}
        </div>
      ))}
    </Marquee>
  );
}
