"use client";

import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Button } from "../button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import { Switch } from "../switch/switch";
import { Textarea } from "../textarea/textarea";

const sections = ["Profile", "Notifications", "Billing", "Security", "Danger zone"];

const notifications = [
  { id: "mentions", label: "Mentions", description: "When someone mentions you.", on: true },
  { id: "comments", label: "Comments", description: "Replies on your projects.", on: true },
  { id: "digest", label: "Weekly digest", description: "A summary every Monday.", on: false },
];

export default function Settings01() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and how we contact you.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-[12rem_1fr]">
        <nav aria-label="Settings" className="flex gap-1 overflow-x-auto md:flex-col">
          {sections.map((section, i) => (
            <Button
              key={section}
              variant={i === 0 ? "secondary" : "ghost"}
              aria-current={i === 0 ? "page" : undefined}
              className="shrink-0 justify-start"
            >
              {section}
            </Button>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others see you.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    <AvatarFallback className="text-lg">SC</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change photo
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="settings-name">Name</FieldLabel>
                    <Input id="settings-name" defaultValue="Sofia Chen" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="settings-email">Email</FieldLabel>
                    <Input id="settings-email" type="email" defaultValue="sofia@acme.com" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="settings-bio">Bio</FieldLabel>
                  <Textarea id="settings-bio" placeholder="A few words about you" />
                  <FieldDescription>Shown on your public profile.</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what we email you about.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {notifications.map((n) => (
                <Field key={n.id} orientation="horizontal" className="justify-between">
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor={`notify-${n.id}`}>{n.label}</FieldLabel>
                    <FieldDescription>{n.description}</FieldDescription>
                  </div>
                  <Switch id={`notify-${n.id}`} defaultChecked={n.on} />
                </Field>
              ))}
            </CardContent>
          </Card>
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle>Delete account</CardTitle>
              <CardDescription>
                Removes your account and all its projects. This can't be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive">Delete account</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
