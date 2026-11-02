"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Button } from "../button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import { Input } from "../input/input";
import { Progress } from "../progress/progress";

const points = ["Set up in two minutes", "Works with your existing tools", "Cancel any time"];

export default function Hero02() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Hit every goal, without the spreadsheet
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Track goals across your team, see what&apos;s at risk early, and celebrate what ships.
          </p>
          <ul className="mt-6 grid gap-2 text-sm">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" /> {point}
              </li>
            ))}
          </ul>
          {sent ? (
            <p className="mt-8 rounded-lg border bg-muted/50 p-3 text-sm">
              Thanks! We sent an invite to <strong>{email}</strong>.
            </p>
          ) : (
            <form
              className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Input
                type="email"
                required
                placeholder="you@company.com"
                aria-label="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit">Get early access</Button>
            </form>
          )}
        </div>
        <Card className="mx-auto w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle>Q4 goals</CardTitle>
            <CardDescription>3 of 4 on track</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {[
              ["Launch the mobile app", 82, "GH"],
              ["Reach 10k paying users", 64, "AL"],
              ["Cut p95 latency to 200 ms", 91, "LT"],
              ["Hire two designers", 30, "SD"],
            ].map(([goal, value, owner]) => (
              <div key={goal as string} className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{owner}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">{goal}</span>
                  <span className="text-muted-foreground tabular-nums">{value}%</span>
                </div>
                <Progress value={value as number} aria-label={goal as string} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
