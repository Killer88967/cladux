import { ActivityIcon, CreditCardIcon, DollarSignIcon, UsersIcon } from "lucide-react";
import {
  Stat,
  StatDelta,
  StatDescription,
  StatGroup,
  StatHeader,
  StatIcon,
  StatLabel,
  StatValue,
} from "@cladux/ui";

const stats = [
  { label: "Revenue", value: "$48,290", delta: "12.4%", trend: "up", icon: DollarSignIcon },
  { label: "Subscribers", value: "2,350", delta: "4.1%", trend: "up", icon: UsersIcon },
  {
    label: "Refunds",
    value: "$1,120",
    delta: "2.3%",
    trend: "down",
    icon: CreditCardIcon,
    invert: true,
  },
  { label: "Active now", value: "573", delta: "0%", trend: "neutral", icon: ActivityIcon },
] as const;

export default function StatGroupDemo() {
  return (
    <StatGroup className="lg:grid-cols-2">
      {stats.map((stat) => (
        <Stat key={stat.label}>
          <StatHeader>
            <StatLabel>{stat.label}</StatLabel>
            <StatIcon>
              <stat.icon />
            </StatIcon>
          </StatHeader>
          <StatValue>{stat.value}</StatValue>
          <StatDescription>
            <StatDelta trend={stat.trend} invert={"invert" in stat && stat.invert}>
              {stat.delta}
            </StatDelta>
            this week
          </StatDescription>
        </Stat>
      ))}
    </StatGroup>
  );
}
