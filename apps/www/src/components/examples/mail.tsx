"use client";

import {
  ArchiveIcon,
  ArrowLeftIcon,
  FileIcon,
  InboxIcon,
  ReplyIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Input,
  RelativeTime,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Separator,
  Switch,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@cladux/ui";

interface Mail {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  hoursAgo: number;
  read: boolean;
  labels: string[];
}

const mails: Mail[] = [
  {
    id: "1",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Meeting tomorrow",
    text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the details and have some ideas I'd like to share. It's crucial that we align on our next steps to keep the project on track.\n\nPlease come prepared with any questions or insights you may have. Looking forward to it.\n\nBest regards, William",
    hoursAgo: 2,
    read: false,
    labels: ["meeting", "work"],
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Re: Project update",
    text: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.\n\nI have a few minor suggestions that I'll include in the attached document.",
    hoursAgo: 9,
    read: true,
    labels: ["work"],
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Weekend plans",
    text: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun. If you're interested, let me know, and we can plan the details.",
    hoursAgo: 30,
    read: true,
    labels: ["personal"],
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Re: Question about budget",
    text: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources. I've reviewed the budget report and identified a few areas where we might be able to optimize our spending.",
    hoursAgo: 52,
    read: false,
    labels: ["work", "budget"],
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Important announcement",
    text: "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch. We've received valuable feedback from our beta testers.",
    hoursAgo: 120,
    read: false,
    labels: ["meeting", "important"],
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarahbrown@example.com",
    subject: "Re: Feedback on proposal",
    text: "Thank you for your feedback on the proposal. It's great to hear that you found it promising. I'll make the suggested revisions and send you the updated version by the end of the week.",
    hoursAgo: 200,
    read: true,
    labels: ["work"],
  },
];

const folders = [
  { name: "Inbox", icon: InboxIcon, count: 128 },
  { name: "Drafts", icon: FileIcon, count: 9 },
  { name: "Sent", icon: SendIcon },
  { name: "Starred", icon: StarIcon },
  { name: "Archive", icon: ArchiveIcon },
  { name: "Trash", icon: Trash2Icon },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

function useNow() {
  // Fixed when the page opens, so the times stay put.
  const [now] = React.useState(() => Date.now());
  return now;
}

function MailList({
  items,
  selected,
  onSelect,
}: {
  items: Mail[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const now = useNow();
  return (
    <div className="flex flex-col gap-2 p-3 pt-0">
      {items.map((mail) => (
        <button
          key={mail.id}
          type="button"
          onClick={() => onSelect(mail.id)}
          data-selected={selected === mail.id || undefined}
          className="flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:bg-muted"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-semibold">{mail.name}</span>
            {!mail.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
            <RelativeTime
              date={now - mail.hoursAgo * 3_600_000}
              className={cn(
                "ms-auto text-xs",
                selected === mail.id ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </div>
          <span className="text-xs font-medium">{mail.subject}</span>
          <p className="line-clamp-2 text-xs text-muted-foreground">{mail.text}</p>
          <div className="flex gap-1">
            {mail.labels.map((label) => (
              <Badge key={label} variant={label === "important" ? "default" : "secondary"}>
                {label}
              </Badge>
            ))}
          </div>
        </button>
      ))}
      {items.length === 0 && (
        <p className="p-8 text-center text-sm text-muted-foreground">No messages.</p>
      )}
    </div>
  );
}

function MailDisplay({ mail, onBack }: { mail: Mail | undefined; onBack?: () => void }) {
  const now = useNow();
  if (!mail) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
        No message selected
      </div>
    );
  }
  const actions = [
    { label: "Archive", icon: ArchiveIcon },
    { label: "Move to trash", icon: Trash2Icon },
    { label: "Reply", icon: ReplyIcon },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center gap-1 px-2">
        {onBack && (
          <Button variant="ghost" size="icon" aria-label="Back to inbox" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
        )}
        {actions.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={action.label}>
                <action.icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <Separator />
      <div className="flex items-start gap-3 p-4">
        <Avatar>
          <AvatarFallback>{initials(mail.name)}</AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 gap-0.5 text-sm">
          <span className="font-semibold">{mail.name}</span>
          <span className="truncate text-xs">{mail.subject}</span>
          <span className="truncate text-xs text-muted-foreground">Reply-To: {mail.email}</span>
        </div>
        <RelativeTime
          date={now - mail.hoursAgo * 3_600_000}
          className="text-xs text-muted-foreground"
        />
      </div>
      <Separator />
      <div className="flex-1 p-4 text-sm whitespace-pre-wrap">{mail.text}</div>
      <Separator />
      <form className="grid gap-3 p-4" onSubmit={(e) => e.preventDefault()}>
        <Textarea placeholder={`Reply to ${mail.name}...`} className="min-h-20" />
        <div className="flex items-center">
          <Label className="gap-2 text-xs font-normal">
            <Switch size="sm" aria-label="Mute this thread" /> Mute this thread
          </Label>
          <Button size="sm" className="ms-auto">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export function MailExample() {
  const [selected, setSelected] = React.useState<string | null>("1");
  const [tab, setTab] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [folder, setFolder] = React.useState("Inbox");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items = mails.filter(
    (m) =>
      (tab === "all" || !m.read) &&
      `${m.name} ${m.subject} ${m.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  const current = mails.find((m) => m.id === selected);

  const listHeader = (
    <>
      <div className="flex h-12 items-center px-3">
        <h2 className="text-lg font-semibold">{folder}</h2>
        <TabsList className="ms-auto">
          <TabsTrigger value="all">All mail</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </div>
      <div className="p-3">
        <div className="relative">
          <SearchIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="ps-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search mail"
          />
        </div>
      </div>
    </>
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-0">
      {/* Desktop: three resizable panes. */}
      <div className="hidden h-[680px] md:block">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="20%" minSize="14%" maxSize="28%">
            <div className="flex h-12 items-center px-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
                  A
                </span>
                Alicia Koch
              </span>
            </div>
            <Separator />
            <nav className="grid gap-0.5 p-2">
              {folders.map((f) => (
                <Button
                  key={f.name}
                  variant={folder === f.name ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setFolder(f.name)}
                >
                  <f.icon />
                  {f.name}
                  {f.count && (
                    <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                      {f.count}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="38%" minSize="28%">
            <div className="flex h-full flex-col">
              {listHeader}
              <ScrollArea className="min-h-0 flex-1">
                <MailList items={items} selected={selected} onSelect={setSelected} />
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="42%" minSize="30%">
            <MailDisplay mail={current} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Phones: the list, then the message on its own. */}
      <div className="md:hidden">
        {mobileOpen ? (
          <MailDisplay mail={current} onBack={() => setMobileOpen(false)} />
        ) : (
          <>
            {listHeader}
            <MailList
              items={items}
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                setMobileOpen(true);
              }}
            />
          </>
        )}
      </div>
    </Tabs>
  );
}
