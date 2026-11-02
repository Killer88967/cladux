"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card/card";
import { Label } from "../label/label";
import { Switch } from "../switch/switch";

const plans = [
  {
    name: "Hobby",
    description: "For side projects and trying things out.",
    monthly: 0,
    features: ["1 project", "Community support", "1 GB storage"],
  },
  {
    name: "Pro",
    description: "For growing teams that ship every week.",
    monthly: 24,
    popular: true,
    features: ["Unlimited projects", "Priority support", "100 GB storage", "Custom domains"],
  },
  {
    name: "Enterprise",
    description: "For companies with security needs.",
    monthly: 99,
    features: ["Everything in Pro", "SSO and audit logs", "1 TB storage", "99.99% uptime SLA"],
  },
];

export default function Pricing01() {
  const [yearly, setYearly] = React.useState(true);
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team grows.</p>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <Label htmlFor="pricing-01-yearly" className="font-normal">
              Monthly
            </Label>
            <Switch id="pricing-01-yearly" checked={yearly} onCheckedChange={setYearly} />
            <Label htmlFor="pricing-01-yearly" className="font-normal">
              Yearly <Badge variant="secondary">2 months free</Badge>
            </Label>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? Math.round((plan.monthly * 10) / 12) : plan.monthly;
            return (
              <Card key={plan.name} className={plan.popular ? "ring-2 ring-primary" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.popular && <Badge>Most popular</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <p>
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">
                      ${price}
                    </span>
                    <span className="text-muted-foreground"> / month</span>
                    {yearly && plan.monthly > 0 && (
                      <span className="block text-xs text-muted-foreground">Billed yearly</span>
                    )}
                  </p>
                  <ul className="grid gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckIcon className="size-4 text-primary" /> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
