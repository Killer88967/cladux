import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@cladux/ui";

const events = [
  {
    title: "Project created",
    time: "Jan 4",
    description: "Set up the repository and the first page.",
  },
  { title: "Beta launch", time: "Mar 18", description: "Opened sign-ups to the first 500 people." },
  { title: "1.0 released", time: "Jun 2", description: "Stable API, docs and a new pricing page." },
  { title: "Mobile app", time: "Planned", description: "iOS and Android, sharing the same API." },
];

export default function TimelineDemo() {
  return (
    <Timeline className="max-w-sm">
      {events.map((event, i) => (
        <TimelineItem key={event.title}>
          <TimelineDot variant={i < 3 ? "primary" : "default"} />
          <TimelineContent>
            <TimelineHeader>
              <TimelineTitle>{event.title}</TimelineTitle>
              <TimelineTime>{event.time}</TimelineTime>
            </TimelineHeader>
            <TimelineDescription>{event.description}</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
