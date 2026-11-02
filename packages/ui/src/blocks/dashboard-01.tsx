"use client";

import {
  BarChart3Icon,
  BellIcon,
  FolderIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../chart/chart";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../sheet/sheet";
import { Stat, StatDelta, StatDescription, StatLabel, StatValue } from "../stat/stat";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "../timeline/timeline";

const nav = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "Projects", icon: FolderIcon, badge: "12" },
  { label: "Team", icon: UsersIcon },
  { label: "Reports", icon: BarChart3Icon },
  { label: "Settings", icon: SettingsIcon },
];

const data = [
  { day: "Mon", visits: 1200 },
  { day: "Tue", visits: 1850 },
  { day: "Wed", visits: 1600 },
  { day: "Thu", visits: 2300 },
  { day: "Fri", visits: 2100 },
  { day: "Sat", visits: 1400 },
  { day: "Sun", visits: 1700 },
];

const config = { visits: { label: "Visits", color: "var(--chart-1)" } } satisfies ChartConfig;

const activity = [
  { title: "Grace deployed api v2.3", time: "2 min ago", variant: "primary" },
  { title: "Linus opened 3 issues", time: "1 hour ago", variant: "default" },
  { title: "Invoice #2041 paid", time: "3 hours ago", variant: "success" },
  { title: "Ada joined the team", time: "Yesterday", variant: "default" },
] as const;

function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex items-center gap-2 px-2 py-1 font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
          A
        </span>
        Acme
      </div>
      <nav className="grid gap-0.5">
        {nav.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "secondary" : "ghost"}
            className="justify-start"
          >
            <item.icon />
            {item.label}
            {item.badge && (
              <Badge variant="outline" className="ms-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 rounded-lg p-2">
        <Avatar className="size-8">
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">Alicia Koch</p>
          <p className="truncate text-xs text-muted-foreground">alicia@acme.dev</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard01() {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-60 shrink-0 border-e bg-muted/30 md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation</SheetDescription>
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold">Home</h1>
          <Button variant="ghost" size="icon" className="ms-auto" aria-label="Notifications">
            <BellIcon />
          </Button>
        </header>
        <main className="grid gap-4 p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat>
              <StatLabel>Visitors</StatLabel>
              <StatValue>12,150</StatValue>
              <StatDescription>
                <StatDelta trend="up">8.2%</StatDelta> this week
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Conversion</StatLabel>
              <StatValue>3.4%</StatValue>
              <StatDescription>
                <StatDelta trend="up">0.6%</StatDelta> this week
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Bounce rate</StatLabel>
              <StatValue>41%</StatValue>
              <StatDescription>
                <StatDelta trend="down" invert>
                  2.1%
                </StatDelta>{" "}
                this week
              </StatDescription>
            </Stat>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Traffic</CardTitle>
                <CardDescription>Visits over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={config} className="aspect-auto h-60 w-full">
                  <AreaChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="visits"
                      type="monotone"
                      fill="var(--color-visits)"
                      fillOpacity={0.25}
                      stroke="var(--color-visits)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {activity.map((item) => (
                    <TimelineItem key={item.title}>
                      <TimelineDot variant={item.variant} />
                      <TimelineContent>
                        <TimelineTitle>{item.title}</TimelineTitle>
                        <TimelineTime>{item.time}</TimelineTime>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
