import {
  CheckIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  XIcon,
} from "lucide-react";
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

export default function TimelineIcons() {
  return (
    <Timeline className="max-w-sm">
      <TimelineItem>
        <TimelineDot size="icon" variant="muted">
          <GitPullRequestIcon />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Pull request opened</TimelineTitle>
            <TimelineTime dateTime="2026-10-28T09:12">9:12 AM</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Add a tree view to the sidebar.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot size="icon" variant="muted">
          <GitCommitIcon />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>3 commits pushed</TimelineTitle>
            <TimelineTime dateTime="2026-10-28T10:40">10:40 AM</TimelineTime>
          </TimelineHeader>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot size="icon" variant="destructive">
          <XIcon />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Checks failed</TimelineTitle>
            <TimelineTime dateTime="2026-10-28T10:44">10:44 AM</TimelineTime>
          </TimelineHeader>
          <TimelineDescription>Typecheck found 2 errors.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot size="icon" variant="muted">
          <MessageSquareIcon />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Review requested</TimelineTitle>
            <TimelineTime dateTime="2026-10-28T11:02">11:02 AM</TimelineTime>
          </TimelineHeader>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot size="icon" variant="success">
          <CheckIcon />
        </TimelineDot>
        <TimelineContent>
          <TimelineHeader>
            <TimelineTitle>Merged</TimelineTitle>
            <TimelineTime dateTime="2026-10-28T13:30">1:30 PM</TimelineTime>
          </TimelineHeader>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
