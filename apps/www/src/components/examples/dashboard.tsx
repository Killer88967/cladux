"use client";

import {
  ActivityIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  DownloadIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Input,
  Progress,
  Stat,
  StatDelta,
  StatDescription,
  StatGroup,
  StatHeader,
  StatIcon,
  StatLabel,
  StatValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ChartConfig,
} from "@cladux/ui";

const revenue = [
  { month: "Jan", total: 4200 },
  { month: "Feb", total: 3800 },
  { month: "Mar", total: 5100 },
  { month: "Apr", total: 4700 },
  { month: "May", total: 6200 },
  { month: "Jun", total: 5800 },
  { month: "Jul", total: 6900 },
  { month: "Aug", total: 6400 },
  { month: "Sep", total: 7300 },
  { month: "Oct", total: 7900 },
  { month: "Nov", total: 7100 },
  { month: "Dec", total: 8600 },
];

const revenueConfig = {
  total: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const sales = [
  { name: "Olivia Martin", email: "olivia@example.com", amount: "+$1,999.00" },
  { name: "Jackson Lee", email: "jackson@example.com", amount: "+$39.00" },
  { name: "Isabella Nguyen", email: "isabella@example.com", amount: "+$299.00" },
  { name: "William Kim", email: "will@example.com", amount: "+$99.00" },
  { name: "Sofia Davis", email: "sofia@example.com", amount: "+$39.00" },
];

const orders = [
  { id: "INV-2041", customer: "Acme Inc.", status: "Paid", amount: "$2,400.00" },
  { id: "INV-2040", customer: "Globex", status: "Pending", amount: "$1,250.00" },
  { id: "INV-2039", customer: "Initech", status: "Paid", amount: "$860.00" },
  { id: "INV-2038", customer: "Umbrella", status: "Overdue", amount: "$3,100.00" },
  { id: "INV-2037", customer: "Hooli", status: "Paid", amount: "$540.00" },
];

const channels = [
  { name: "Organic search", value: 48 },
  { name: "Direct", value: 27 },
  { name: "Referral", value: 15 },
  { name: "Social", value: 10 },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("");

export function DashboardExample() {
  return (
    <div className="flex min-w-0 flex-col">
      <header className="flex h-14 items-center gap-4 border-b px-4">
        <span className="font-semibold">Acme</span>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <a className="text-foreground">Overview</a>
          <a className="text-muted-foreground hover:text-foreground">Customers</a>
          <a className="text-muted-foreground hover:text-foreground">Products</a>
          <a className="text-muted-foreground hover:text-foreground">Settings</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden sm:block">
            <SearchIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="w-56 ps-8" />
          </div>
          <Avatar className="size-8">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon /> Jan 1 – Dec 31
            </Button>
            <Button>
              <DownloadIcon /> Download
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex flex-col gap-4">
            <StatGroup>
              <Stat>
                <StatHeader>
                  <StatLabel>Total revenue</StatLabel>
                  <StatIcon>
                    <DollarSignIcon />
                  </StatIcon>
                </StatHeader>
                <StatValue>$45,231.89</StatValue>
                <StatDescription>
                  <StatDelta trend="up">20.1%</StatDelta> from last month
                </StatDescription>
              </Stat>
              <Stat>
                <StatHeader>
                  <StatLabel>Subscriptions</StatLabel>
                  <StatIcon>
                    <UsersIcon />
                  </StatIcon>
                </StatHeader>
                <StatValue>+2,350</StatValue>
                <StatDescription>
                  <StatDelta trend="up">18.1%</StatDelta> from last month
                </StatDescription>
              </Stat>
              <Stat>
                <StatHeader>
                  <StatLabel>Sales</StatLabel>
                  <StatIcon>
                    <CreditCardIcon />
                  </StatIcon>
                </StatHeader>
                <StatValue>+12,234</StatValue>
                <StatDescription>
                  <StatDelta trend="down">4.3%</StatDelta> from last month
                </StatDescription>
              </Stat>
              <Stat>
                <StatHeader>
                  <StatLabel>Active now</StatLabel>
                  <StatIcon>
                    <ActivityIcon />
                  </StatIcon>
                </StatHeader>
                <StatValue>+573</StatValue>
                <StatDescription>
                  <StatDelta trend="up">201</StatDelta> since last hour
                </StatDescription>
              </Stat>
            </StatGroup>
            <div className="grid gap-4 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Revenue by month this year.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={revenueConfig} className="aspect-auto h-72 w-full">
                    <BarChart data={revenue}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tickFormatter={(v: number) => `$${v / 1000}k`}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent sales</CardTitle>
                  <CardDescription>You made 265 sales this month.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {sales.map((sale) => (
                    <div key={sale.email} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(sale.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{sale.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{sale.email}</p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{sale.amount}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Latest invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <InvoicesTable />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Traffic</CardTitle>
                  <CardDescription>Where visitors came from.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {channels.map((c) => (
                    <div key={c.name} className="grid gap-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="text-muted-foreground tabular-nums">{c.value}%</span>
                      </div>
                      <Progress value={c.value} aria-label={c.name} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <Card>
              <CardContent>
                <InvoicesTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InvoicesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === "Paid"
                    ? "secondary"
                    : order.status === "Overdue"
                      ? "destructive"
                      : "outline"
                }
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{order.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
