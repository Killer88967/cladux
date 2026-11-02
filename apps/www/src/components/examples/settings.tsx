"use client";

import { BellIcon, MonitorIcon, PaletteIcon, ShieldIcon, UserIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ColorPicker,
  ColorPickerSwatches,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  FileUpload,
  FileUploadTrigger,
  Input,
  PasswordInput,
  PasswordStrength,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TagsInput,
  Textarea,
  useFileUpload,
  useFilePreview,
} from "@cladux/ui";

const sections = [
  { id: "profile", title: "Profile", icon: UserIcon },
  { id: "account", title: "Account", icon: ShieldIcon },
  { id: "appearance", title: "Appearance", icon: PaletteIcon },
  { id: "notifications", title: "Notifications", icon: BellIcon },
  { id: "display", title: "Display", icon: MonitorIcon },
] as const;

type Section = (typeof sections)[number]["id"];

const save = (what: string) => (e: React.FormEvent) => {
  e.preventDefault();
  toast.success(`${what} saved`);
};

function AvatarPicker() {
  const { files } = useFileUpload();
  const url = useFilePreview(files[0]);
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-14">
        {url && <AvatarImage src={url} alt="Your new photo" />}
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <FileUploadTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Change photo
          </Button>
        </FileUploadTrigger>
        <p className="text-xs text-muted-foreground">PNG or JPG, up to 2 MB.</p>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <form onSubmit={save("Profile")}>
      <FieldGroup>
        <FileUpload
          multiple={false}
          accept="image/png,image/jpeg"
          maxSize={2 * 1024 * 1024}
          onReject={(r) => toast.error(r[0]!.message)}
        >
          <AvatarPicker />
        </FileUpload>
        <Field>
          <FieldLabel htmlFor="settings-username">Username</FieldLabel>
          <Input id="settings-username" defaultValue="alicia" />
          <FieldDescription>
            Your public display name. You can change it once a month.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <Select defaultValue="work">
            <SelectTrigger id="settings-email" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">alicia@acme.dev</SelectItem>
              <SelectItem value="personal">alicia.koch@example.com</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-bio">Bio</FieldLabel>
          <Textarea
            id="settings-bio"
            defaultValue="I build design systems and drink too much coffee."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-skills">Skills</FieldLabel>
          <TagsInput id="settings-skills" defaultValue={["React", "TypeScript", "CSS"]} />
        </Field>
        <Button className="self-start">Update profile</Button>
      </FieldGroup>
    </form>
  );
}

function Account() {
  const [password, setPassword] = React.useState("");
  return (
    <form onSubmit={save("Password")}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="settings-current">Current password</FieldLabel>
          <PasswordInput id="settings-current" autoComplete="current-password" />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-new">New password</FieldLabel>
          <PasswordInput
            id="settings-new"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength value={password} showRules={false} />
        </Field>
        <FieldSeparator />
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Two-factor authentication</FieldTitle>
            <FieldDescription>Ask for a code from your phone when you sign in.</FieldDescription>
          </FieldContent>
          <Switch defaultChecked aria-label="Two-factor authentication" />
        </Field>
        <Button className="self-start">Update password</Button>
      </FieldGroup>
    </form>
  );
}

function Appearance() {
  const [accent, setAccent] = React.useState("#3b82f6");
  return (
    <form onSubmit={save("Appearance")}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Theme</FieldLegend>
          <RadioGroup defaultValue="system" className="grid grid-cols-3 gap-3">
            {["light", "dark", "system"].map((theme) => (
              <FieldLabel key={theme} htmlFor={`settings-theme-${theme}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle className="capitalize">{theme}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value={theme} id={`settings-theme-${theme}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
        <Field>
          <FieldLabel>Accent color</FieldLabel>
          <ColorPicker value={accent} onValueChange={setAccent}>
            <ColorPickerSwatches
              colors={["#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#0f172a"]}
            />
          </ColorPicker>
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-font">Font</FieldLabel>
          <Select defaultValue="geist">
            <SelectTrigger id="settings-font" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geist">Geist</SelectItem>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Button className="self-start">Update preferences</Button>
      </FieldGroup>
    </form>
  );
}

function Notifications() {
  const rows = [
    {
      id: "comments",
      title: "Comments",
      description: "When someone comments on your post.",
      on: true,
    },
    { id: "mentions", title: "Mentions", description: "When someone mentions you.", on: true },
    {
      id: "marketing",
      title: "Product news",
      description: "New features and launches.",
      on: false,
    },
    {
      id: "security",
      title: "Security",
      description: "Sign-ins from new devices. Always on.",
      on: true,
      disabled: true,
    },
  ];
  return (
    <form onSubmit={save("Notification settings")}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Email notifications</FieldLegend>
          <FieldGroup className="gap-4">
            {rows.map((row) => (
              <Field key={row.id} orientation="horizontal" className="rounded-lg border p-3">
                <FieldContent>
                  <FieldLabel htmlFor={`settings-notify-${row.id}`}>{row.title}</FieldLabel>
                  <FieldDescription>{row.description}</FieldDescription>
                </FieldContent>
                <Switch
                  id={`settings-notify-${row.id}`}
                  defaultChecked={row.on}
                  disabled={row.disabled}
                />
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        <Button className="self-start">Save</Button>
      </FieldGroup>
    </form>
  );
}

function Display() {
  return (
    <form onSubmit={save("Display settings")}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Density</FieldLegend>
          <FieldDescription>How much fits on the screen.</FieldDescription>
          <RadioGroup defaultValue="comfortable">
            {[
              ["compact", "Compact", "Smaller spacing, more rows."],
              ["comfortable", "Comfortable", "The default."],
              ["spacious", "Spacious", "Larger targets, easier on touch screens."],
            ].map(([value, title, description]) => (
              <FieldLabel key={value} htmlFor={`settings-density-${value}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{title}</FieldTitle>
                    <FieldDescription>{description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={value!} id={`settings-density-${value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
        <Button className="self-start">Update display</Button>
      </FieldGroup>
    </form>
  );
}

const panels: Record<Section, { description: string; Component: () => React.ReactNode }> = {
  profile: { description: "This is how others see you on the site.", Component: Profile },
  account: { description: "Your password and sign-in security.", Component: Account },
  appearance: { description: "Choose how the app looks.", Component: Appearance },
  notifications: { description: "Choose what we email you about.", Component: Notifications },
  display: { description: "Change how content is laid out.", Component: Display },
};

export function SettingsExample() {
  const [section, setSection] = React.useState<Section>("profile");
  const { description, Component } = panels[section];
  const title = sections.find((s) => s.id === section)!.title;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <nav
          aria-label="Settings"
          className="-mx-1 flex scrollbar-none gap-1 overflow-x-auto lg:mx-0 lg:w-48 lg:shrink-0 lg:flex-col"
        >
          {sections.map((s) => (
            <Button
              key={s.id}
              variant={section === s.id ? "secondary" : "ghost"}
              className="justify-start"
              aria-current={section === s.id ? "page" : undefined}
              onClick={() => setSection(s.id)}
            >
              <s.icon />
              {s.title}
            </Button>
          ))}
        </nav>
        <section className="max-w-xl flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
          <Component />
        </section>
      </div>
    </div>
  );
}
