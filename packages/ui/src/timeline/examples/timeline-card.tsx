import {
  Badge,
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@cladux/ui";

const releases = [
  { version: "v2.1.0", time: "Oct 30", notes: "Tree View, Stepper and Timeline.", latest: true },
  { version: "v2.0.0", time: "Oct 12", notes: "The CSS style: every component without Tailwind." },
  { version: "v1.4.0", time: "Sep 3", notes: "Calendar and date picker." },
];

export default function TimelineCard() {
  return (
    <Timeline className="max-w-md">
      {releases.map((release) => (
        <TimelineItem key={release.version}>
          <TimelineDot variant={release.latest ? "primary" : "default"} className="mt-4" />
          <TimelineContent className="rounded-lg border p-3">
            <TimelineHeader>
              <TimelineTitle className="flex items-center gap-2">
                {release.version}
                {release.latest && <Badge variant="secondary">Latest</Badge>}
              </TimelineTitle>
              <TimelineTime>{release.time}</TimelineTime>
            </TimelineHeader>
            <TimelineDescription>{release.notes}</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
