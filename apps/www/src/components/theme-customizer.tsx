"use client";

import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useCopyToClipboard,
} from "@cladux/ui";
import {
  DEFAULT_THEME,
  parseThemeCode,
  RADII,
  themeCode,
  themeCss,
  type Radius,
  type Theme,
  type ThemeColors,
} from "cladux-registry";
import { CopyButton } from "./copy-button";
import { accentColors, baseColors } from "@/lib/themes";

const colors: ThemeColors = { bases: baseColors, accents: accentColors };

/** The theme in the page's URL (?theme=zinc-violet), so a link opens it. */
function themeFromUrl() {
  const code = new URLSearchParams(window.location.search).get("theme");
  try {
    return code ? parseThemeCode(code, colors) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** A dot showing a theme's primary color in light mode. */
function Swatch({ color }: { color: string }) {
  return (
    <span
      className="size-4 shrink-0 rounded-full ring-1 ring-foreground/15"
      style={{ backgroundColor: color }}
    />
  );
}

function Option({
  selected,
  onClick,
  label,
  color,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      aria-pressed={selected}
      onClick={onClick}
      className={cn("gap-2", selected && "border-primary ring-1 ring-primary")}
    >
      {color && <Swatch color={color} />}
      {children ?? label}
      {selected && <CheckIcon className="ms-auto" />}
    </Button>
  );
}

function CopyCodeButton({ state }: { state: Theme }) {
  const { copied, copy } = useCopyToClipboard();
  const [style, setStyle] = React.useState<"tailwind" | "css">("tailwind");
  const code = themeCss(state, colors, style);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <CopyIcon /> Copy code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Theme</DialogTitle>
          <DialogDescription>
            Paste this into your global stylesheet, after the Cladux import.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 py-1 ps-3 pe-1 text-sm">
          <span className="text-muted-foreground">Theme code</span>
          <code className="font-mono font-medium">{themeCode(state)}</code>
          <CopyButton value={themeCode(state)} aria-label="Copy theme code" className="ms-auto" />
        </div>
        <Tabs
          value={style}
          onValueChange={(v) => setStyle(v as "tailwind" | "css")}
          className="min-w-0"
        >
          <TabsList>
            <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>
          {(["tailwind", "css"] as const).map((s) => (
            <TabsContent key={s} value={s} className="min-w-0">
              <div className="relative">
                <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
                  <code>{themeCss(state, colors, s)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => copy(code)}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-xs text-muted-foreground">
          The Tailwind style uses the same variable names as shadcn/ui, so this works in shadcn
          projects too. The CSS style prefixes them with <code>cl-</code>.
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Pick a base color, an accent and a radius. The whole page, including dialogs
 * and menus, switches to the theme while you're here.
 */
export function ThemeCustomizer({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Theme>(DEFAULT_THEME);
  const live = themeCss(state, colors, "tailwind");
  const isDefault = themeCode(state) === themeCode(DEFAULT_THEME);

  // Open the theme from the URL, then keep the URL up to date so it can be shared.
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    setState(themeFromUrl());
    setLoaded(true);
  }, []);
  React.useEffect(() => {
    if (!loaded) return;
    const url = new URL(window.location.href);
    if (isDefault) url.searchParams.delete("theme");
    else url.searchParams.set("theme", themeCode(state));
    window.history.replaceState(window.history.state, "", url);
  }, [state, isDefault, loaded]);

  return (
    <>
      {/* Applied to the page while it's open; removed when you leave. */}
      <style>{live}</style>
      <div className="mb-8 grid gap-5 rounded-xl border bg-card p-4 sm:p-5">
        <div className="grid gap-2">
          <Label>Base color</Label>
          <div className="flex flex-wrap gap-2">
            {baseColors.map((theme) => (
              <Option
                key={theme.name}
                label={theme.title}
                color={theme.light["muted-foreground"]}
                selected={state.base === theme.name}
                onClick={() => setState({ ...state, base: theme.name })}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Accent</Label>
          <div className="flex flex-wrap gap-1.5">
            <Option
              label="None"
              selected={!state.accent}
              onClick={() => setState({ ...state, accent: undefined })}
            />
            {accentColors.map((theme) => (
              <Tooltip key={theme.name}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={theme.title}
                    aria-pressed={state.accent === theme.name}
                    onClick={() => setState({ ...state, accent: theme.name })}
                    className={cn(
                      state.accent === theme.name && "border-primary ring-1 ring-primary",
                    )}
                  >
                    <Swatch color={theme.light.primary!} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme.title}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          <div className="grid gap-2">
            <Label>Radius</Label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(RADII) as [Radius, string][]).map(([r, value]) => (
                <Option
                  key={r}
                  label={value.replace("rem", "")}
                  selected={state.radius === r}
                  onClick={() => setState({ ...state, radius: r })}
                />
              ))}
            </div>
          </div>
          <div className="ms-auto flex gap-2">
            <Button variant="ghost" disabled={isDefault} onClick={() => setState(DEFAULT_THEME)}>
              <RotateCcwIcon /> Reset
            </Button>
            <CopyCodeButton state={state} />
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
