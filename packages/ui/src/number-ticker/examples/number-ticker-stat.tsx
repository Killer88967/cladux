import { DollarSignIcon, UsersIcon } from "lucide-react";
import {
  NumberTicker,
  Stat,
  StatDelta,
  StatDescription,
  StatGroup,
  StatHeader,
  StatIcon,
  StatLabel,
  StatValue,
} from "@cladux/ui";

export default function NumberTickerStat() {
  return (
    <StatGroup className="max-w-xl lg:grid-cols-2">
      <Stat>
        <StatHeader>
          <StatLabel>Revenue</StatLabel>
          <StatIcon>
            <DollarSignIcon />
          </StatIcon>
        </StatHeader>
        <StatValue>
          <NumberTicker
            value={48290}
            format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          />
        </StatValue>
        <StatDescription>
          <StatDelta trend="up">12.4%</StatDelta>
          this week
        </StatDescription>
      </Stat>
      <Stat>
        <StatHeader>
          <StatLabel>Subscribers</StatLabel>
          <StatIcon>
            <UsersIcon />
          </StatIcon>
        </StatHeader>
        <StatValue>
          <NumberTicker value={2350} effect="roll" />
        </StatValue>
        <StatDescription>
          <StatDelta trend="up">4.1%</StatDelta>
          this week
        </StatDescription>
      </Stat>
    </StatGroup>
  );
}
