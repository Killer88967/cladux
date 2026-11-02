"use client";

import { BellIcon, MailIcon, SmartphoneIcon } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Input,
  Label,
  NumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Stat,
  StatDelta,
  StatHeader,
  StatLabel,
  StatSparkline,
  StatValue,
  Switch,
  TagsInput,
  type ChartConfig,
} from "@cladux/ui";

export function RevenueStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat>
        <StatHeader>
          <StatLabel>Revenue</StatLabel>
          <StatDelta trend="up">12%</StatDelta>
        </StatHeader>
        <StatValue>$48.2k</StatValue>
        <StatSparkline data={[20, 28, 24, 36, 32, 44, 41, 52]} className="mt-1" />
      </Stat>
      <Stat>
        <StatHeader>
          <StatLabel>Churn</StatLabel>
          <StatDelta trend="down" invert>
            0.4%
          </StatDelta>
        </StatHeader>
        <StatValue>2.1%</StatValue>
        <StatSparkline data={[30, 32, 28, 26, 27, 22, 21, 18]} className="mt-1 text-chart-2" />
      </Stat>
    </div>
  );
}

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 314, mobile: 240 },
];

const visitorsConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function VisitorsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors</CardTitle>
        <CardDescription>January to June, by device</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={visitorsConfig} className="aspect-auto h-40 w-full">
          <AreaChart data={visitors} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function CreateProject() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy a new project in one click.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="showcase-project-name">Name</Label>
          <Input id="showcase-project-name" defaultValue="acme-web" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="showcase-framework">Framework</Label>
            <Select defaultValue="next">
              <SelectTrigger id="showcase-framework" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Next.js</SelectItem>
                <SelectItem value="vite">Vite</SelectItem>
                <SelectItem value="astro">Astro</SelectItem>
                <SelectItem value="remix">React Router</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="showcase-instances">Instances</Label>
            <NumberInput id="showcase-instances" defaultValue={2} min={1} max={10} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="showcase-tags">Tags</Label>
          <TagsInput
            id="showcase-tags"
            defaultValue={["web", "production"]}
            placeholder="Add tag"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}

const members = [
  { name: "Ada Lovelace", email: "ada@acme.dev", role: "owner" },
  { name: "Grace Hopper", email: "grace@acme.dev", role: "editor" },
  { name: "Linus Torvalds", email: "linus@acme.dev", role: "viewer" },
];

export function TeamMembers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>Invite people to work with you.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {members.map((member) => (
          <div key={member.email} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            </div>
            <Select defaultValue={member.role}>
              <SelectTrigger size="sm" className="w-24" aria-label={`Role for ${member.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function NotificationSettings() {
  const rows = [
    { icon: MailIcon, title: "Email", description: "Weekly digest and mentions", on: true },
    { icon: SmartphoneIcon, title: "Push", description: "Direct messages only", on: false },
    { icon: BellIcon, title: "In-app", description: "Everything", on: true },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose where you hear from us.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {rows.map((row, i) => (
          <React.Fragment key={row.title}>
            {i > 0 && <Separator className="my-2" />}
            <div className="flex items-center gap-3">
              <row.icon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor={`showcase-notify-${row.title}`}>{row.title}</Label>
                <p className="text-xs text-muted-foreground">{row.description}</p>
              </div>
              <Switch id={`showcase-notify-${row.title}`} defaultChecked={row.on} />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
