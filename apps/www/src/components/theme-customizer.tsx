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
import { accentColors, baseColors, type ThemeVars } from "@/lib/themes";

const RADII = ["0", "0.3rem", "0.5rem", "0.625rem", "0.75rem", "1rem"];

interface ThemeState {
  base: string;
  accent: string | null;
  radius: string;
}

const DEFAULT: ThemeState = { base: "neutral", accent: null, radius: "0.625rem" };

function resolve({ base, accent }: ThemeState) {
  const b = baseColors.find((t) => t.name === base)!;
  const a = accent ? accentColors.find((t) => t.name === accent) : undefined;
  return {
    light: { ...b.light, ...a?.light } as ThemeVars,
    dark: { ...b.dark, ...a?.dark } as ThemeVars,
  };
}

function block(selector: string, vars: ThemeVars, prefix: string, extra?: string) {
  const lines = Object.entries(vars).map(([k, v]) => `  --${prefix}${k}: ${v};`);
  if (extra) lines.unshift(extra);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** The CSS to paste: shadcn's names for the Tailwind style, `--cl-` names for the CSS style. */
function themeCss(state: ThemeState, style: "tailwind" | "css") {
  const { light, dark } = resolve(state);
  const prefix = style === "css" ? "cl-" : "";
  return [
    block(":root", light, prefix, `  --${prefix}radius: ${state.radius};`),
    block(style === "css" ? '.dark,\n[data-theme="dark"]' : ".dark", dark, prefix),
  ].join("\n\n");
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

function CopyCodeButton({ state }: { state: ThemeState }) {
  const { copied, copy } = useCopyToClipboard();
  const [style, setStyle] = React.useState<"tailwind" | "css">("tailwind");
  const code = themeCss(state, style);
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
                  <code>{themeCss(state, s)}</code>
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
  const [state, setState] = React.useState<ThemeState>(DEFAULT);
  const live = themeCss(state, "tailwind");
  const isDefault = JSON.stringify(state) === JSON.stringify(DEFAULT);

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
              selected={state.accent === null}
              onClick={() => setState({ ...state, accent: null })}
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
              {RADII.map((r) => (
                <Option
                  key={r}
                  label={r === "0" ? "0" : r.replace("rem", "")}
                  selected={state.radius === r}
                  onClick={() => setState({ ...state, radius: r })}
                />
              ))}
            </div>
          </div>
          <div className="ms-auto flex gap-2">
            <Button variant="ghost" disabled={isDefault} onClick={() => setState(DEFAULT)}>
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
