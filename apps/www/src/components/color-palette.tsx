"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cladux/ui";
import { palette, type PaletteColor } from "@/lib/colors";

const FORMATS = {
  className: "Class name",
  variable: "CSS variable",
  hex: "Hex",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
} as const;

type Format = keyof typeof FORMATS;

const STORAGE_KEY = "cl-color-format";

function valueOf(name: string, color: PaletteColor, format: Format) {
  if (format === "className") return `bg-${name}-${color.scale}`;
  if (format === "variable") return `var(--color-${name}-${color.scale})`;
  return color[format];
}

/** Every Tailwind color, click to copy in the format you pick. */
export function ColorPalette() {
  const [format, setFormat] = React.useState<Format>("className");
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in FORMATS) setFormat(saved as Format);
    } catch {
      // Storage can be unavailable.
    }
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast(`Copied ${text}`);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  };

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-end gap-2">
        <Label htmlFor="color-format" className="text-muted-foreground">
          Format
        </Label>
        <Select
          value={format}
          onValueChange={(v) => {
            setFormat(v as Format);
            try {
              localStorage.setItem(STORAGE_KEY, v);
            } catch {
              // Ignore.
            }
          }}
        >
          <SelectTrigger id="color-format" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(FORMATS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {Object.entries(palette).map(([name, shades]) => (
        <section key={name} id={name} className="scroll-mt-20">
          <h2 className="mb-2 text-sm font-medium capitalize">{name}</h2>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {shades.map((color) => {
              const id = `${name}-${color.scale}`;
              const value = valueOf(name, color, format);
              return (
                <button
                  key={color.scale}
                  type="button"
                  onClick={() => copy(id, value)}
                  title={value}
                  aria-label={`Copy ${value}`}
                  className="group flex flex-col gap-1.5 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    className="relative flex aspect-[4/3] w-full items-center justify-center rounded-md ring-1 ring-foreground/10 transition-transform ring-inset group-hover:scale-[1.04] sm:aspect-square"
                    style={{ backgroundColor: color.oklch }}
                  >
                    {copied === id && (
                      <CheckIcon
                        className="size-4"
                        style={{ color: color.scale >= 500 ? "white" : "black" }}
                      />
                    )}
                  </span>
                  <span className="px-0.5 font-mono text-[11px] leading-tight">
                    <span className="block font-medium">{color.scale}</span>
                    <span className="block truncate text-muted-foreground">{color.hex}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
