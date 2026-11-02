"use client";

import { PipetteIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { useControllableState } from "../hooks/use-controllable-state";

/* ----------------------------------------------------------------------------
 * Color math. Hue 0-360, everything else 0-1. Values go in and out as hex.
 * --------------------------------------------------------------------------*/

interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function parseHex(hex: string): { r: number; g: number; b: number; a: number } | null {
  let h = hex.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) return null;
  if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}

function hexToHsva(hex: string): Hsva | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max, a: rgb.a };
}

function hsvaToRgba({ h, s, v, a }: Hsva) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return { r: f(5), g: f(3), b: f(1), a };
}

function hsvaToHex(hsva: Hsva) {
  const { r, g, b, a } = hsvaToRgba(hsva);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}${a < 1 ? hex(Math.round(a * 255)) : ""}`;
}

/* ----------------------------------------------------------------------------
 * State
 * --------------------------------------------------------------------------*/

interface ColorPickerContextValue {
  hsva: Hsva;
  hex: string;
  update: (patch: Partial<Hsva>) => void;
  setHex: (hex: string) => boolean;
  disabled: boolean;
}

const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(null);

function useColorPicker() {
  const context = React.useContext(ColorPickerContext);
  if (!context) throw new Error("ColorPicker parts must be inside <ColorPicker>.");
  return context;
}

function ColorPicker({
  className,
  value,
  defaultValue = "#000000",
  onValueChange,
  disabled = false,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** A hex color: #rgb, #rrggbb or #rrggbbaa. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [hex, setHexState] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  // Hue and saturation are kept separately so they survive black, white and grey.
  const [hsva, setHsva] = React.useState<Hsva>(
    () => hexToHsva(hex) ?? { h: 0, s: 0, v: 0, a: 1 },
  );

  // Follow a controlled value that changed outside the picker.
  if (hsvaToHex(hsva) !== hex.toLowerCase()) {
    const next = hexToHsva(hex);
    if (next && hsvaToHex(next) !== hsvaToHex(hsva)) {
      setHsva({
        ...next,
        h: next.s === 0 || next.v === 0 ? hsva.h : next.h,
        s: next.v === 0 ? hsva.s : next.s,
      });
    }
  }

  // The latest color, so several moves between renders build on each other.
  const latest = React.useRef(hsva);
  latest.current = hsva;

  const context = React.useMemo<ColorPickerContextValue>(() => {
    const apply = (next: Hsva) => {
      latest.current = next;
      setHsva(next);
      setHexState(hsvaToHex(next));
    };
    return {
      hsva,
      hex,
      disabled,
      update: (patch) => apply({ ...latest.current, ...patch }),
      setHex: (input) => {
        const next = hexToHsva(input.startsWith("#") ? input : `#${input}`);
        if (!next) return false;
        const prev = latest.current;
        apply({
          ...next,
          h: next.s === 0 || next.v === 0 ? prev.h : next.h,
          s: next.v === 0 ? prev.s : next.s,
        });
        return true;
      },
    };
  }, [hsva, hex, disabled, setHexState]);

  return (
    <ColorPickerContext.Provider value={context}>
      <div
        data-slot="color-picker"
        data-disabled={disabled || undefined}
        className={cn(
          "flex w-full min-w-0 flex-col gap-3 data-disabled:pointer-events-none data-disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </ColorPickerContext.Provider>
  );
}

/* ----------------------------------------------------------------------------
 * Dragging: pointer capture, so a drag keeps going outside the element.
 * --------------------------------------------------------------------------*/

function useDrag(onMove: (x: number, y: number) => void) {
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onMove(
      clamp01((e.clientX - rect.left) / rect.width),
      clamp01((e.clientY - rect.top) / rect.height),
    );
  };
  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      move(e);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
    },
  };
}

const checkerboard =
  "repeating-conic-gradient(rgb(0 0 0 / 0.08) 0% 25%, transparent 0% 50%) 50% / 8px 8px";

function ColorPickerArea({ className, ...props }: React.ComponentProps<"div">) {
  const { hsva, update, disabled } = useColorPicker();
  const drag = useDrag((x, y) => update({ s: x, v: 1 - y }));
  const { r, g, b } = hsvaToRgba({ ...hsva, a: 1 });

  return (
    <div
      data-slot="color-picker-area"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(hsva.s * 100)}%, brightness ${Math.round(hsva.v * 100)}%`}
      aria-valuenow={Math.round(hsva.s * 100)}
      onKeyDown={(e) => {
        const d = e.shiftKey ? 0.1 : 0.01;
        const keys: Record<string, Partial<Hsva>> = {
          ArrowLeft: { s: clamp01(hsva.s - d) },
          ArrowRight: { s: clamp01(hsva.s + d) },
          ArrowUp: { v: clamp01(hsva.v + d) },
          ArrowDown: { v: clamp01(hsva.v - d) },
        };
        if (keys[e.key]) {
          e.preventDefault();
          update(keys[e.key]!);
        }
      }}
      {...drag}
      className={cn(
        "group/color-picker-area relative h-40 w-full shrink-0 cursor-crosshair touch-none rounded-md outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      style={{
        backgroundColor: `hsl(${hsva.h} 100% 50%)`,
        backgroundImage:
          "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
      }}
      {...props}
    >
      <div
        data-slot="color-picker-area-thumb"
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.2),0_1px_3px_rgb(0_0_0/0.3)] transition-shadow group-focus-visible/color-picker-area:shadow-[0_0_0_1px_rgb(0_0_0/0.2),0_0_0_4px_var(--ring)]"
        style={{
          left: `${hsva.s * 100}%`,
          top: `${(1 - hsva.v) * 100}%`,
          backgroundColor: `rgb(${r} ${g} ${b})`,
        }}
      />
    </div>
  );
}

function ChannelSlider({
  className,
  label,
  value,
  max,
  onValueChange,
  background,
  thumbColor,
  format,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  label: string;
  value: number;
  max: number;
  onValueChange: (value: number) => void;
  background: string;
  thumbColor: string;
  format: (value: number) => string;
}) {
  const { disabled } = useColorPicker();
  const drag = useDrag((x) => onValueChange(x * max));
  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={format(value)}
      onKeyDown={(e) => {
        const d = (max / 100) * (e.shiftKey ? 10 : 1);
        const keys: Record<string, number> = {
          ArrowLeft: value - d,
          ArrowDown: value - d,
          ArrowRight: value + d,
          ArrowUp: value + d,
          Home: 0,
          End: max,
        };
        if (e.key in keys) {
          e.preventDefault();
          onValueChange(Math.min(max, Math.max(0, keys[e.key]!)));
        }
      }}
      {...drag}
      className={cn(
        "group/color-picker-slider relative h-3 w-full shrink-0 cursor-pointer touch-none rounded-full outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
        style={{ background }}
      />
      <div
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.2),0_1px_3px_rgb(0_0_0/0.3)] transition-shadow top-1/2"
        style={{ left: `${(value / max) * 100}%`, backgroundColor: thumbColor }}
      />
    </div>
  );
}

function ColorPickerHue({ className, ...props }: React.ComponentProps<"div">) {
  const { hsva, update } = useColorPicker();
  return (
    <ChannelSlider
      data-slot="color-picker-hue"
      label="Hue"
      value={hsva.h}
      max={360}
      onValueChange={(h) => update({ h: Math.min(h, 359.999) })}
      background="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
      thumbColor={`hsl(${hsva.h} 100% 50%)`}
      format={(h) => `${Math.round(h)}°`}
      className={className}
      {...props}
    />
  );
}

function ColorPickerAlpha({ className, ...props }: React.ComponentProps<"div">) {
  const { hsva, update } = useColorPicker();
  const { r, g, b } = hsvaToRgba(hsva);
  return (
    <ChannelSlider
      data-slot="color-picker-alpha"
      label="Opacity"
      value={hsva.a}
      max={1}
      onValueChange={(a) => update({ a: Math.round(a * 100) / 100 })}
      background={`linear-gradient(to right, rgb(${r} ${g} ${b} / 0), rgb(${r} ${g} ${b})), ${checkerboard}`}
      thumbColor={`rgb(${r} ${g} ${b} / ${hsva.a})`}
      format={(a) => `${Math.round(a * 100)}%`}
      className={className}
      {...props}
    />
  );
}

function ColorPickerInput({ className, onBlur, onKeyDown, ...props }: React.ComponentProps<"input">) {
  const { hex, setHex, disabled } = useColorPicker();
  const [draft, setDraft] = React.useState<string | null>(null);
  const commit = () => {
    if (draft !== null) setHex(draft);
    setDraft(null);
  };
  return (
    <input
      data-slot="color-picker-input"
      aria-label="Hex color"
      spellCheck={false}
      autoComplete="off"
      maxLength={9}
      disabled={disabled}
      value={draft ?? hex.toUpperCase()}
      onChange={(e) => {
        setDraft(e.target.value);
        // Apply as soon as it is a full color, so the area follows while typing.
        if (/^#?([0-9a-f]{6}|[0-9a-f]{8})$/i.test(e.target.value)) setHex(e.target.value);
      }}
      onBlur={(e) => {
        commit();
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape" && draft !== null) {
          e.preventDefault();
          setDraft(null);
        }
        onKeyDown?.(e);
      }}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 font-mono text-base uppercase transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed md:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

function ColorPickerEyeDropper({ className, ...props }: React.ComponentProps<"button">) {
  const { setHex, disabled } = useColorPicker();
  const [supported, setSupported] = React.useState(false);
  React.useEffect(() => setSupported("EyeDropper" in window), []);
  if (!supported) return null;

  return (
    <button
      type="button"
      data-slot="color-picker-eye-dropper"
      aria-label="Pick a color from the screen"
      disabled={disabled}
      onClick={async () => {
        try {
          const Dropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
          const result = await new Dropper().open();
          setHex(result.sRGBHex);
        } catch {
          // Cancelled with Escape.
        }
      }}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <PipetteIcon />
    </button>
  );
}

const normalize = (color: string) => {
  const hsva = hexToHsva(color);
  return hsva ? hsvaToHex(hsva) : color;
};

/** Shows a color. Works on its own, e.g. inside a popover trigger. */
function ColorPickerSwatch({
  className,
  color,
  style,
  ...props
}: React.ComponentProps<"span"> & { color: string }) {
  return (
    <span
      data-slot="color-picker-swatch"
      className={cn(
        "relative inline-block size-4 shrink-0 overflow-hidden rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]",
        className,
      )}
      style={{ background: `linear-gradient(${color}, ${color}), ${checkerboard}`, ...style }}
      {...props}
    />
  );
}

function ColorPickerSwatches({
  className,
  colors,
  ...props
}: React.ComponentProps<"div"> & { colors: string[] }) {
  const { hex, setHex, disabled } = useColorPicker();
  return (
    <div
      data-slot="color-picker-swatches"
      role="group"
      aria-label="Swatches"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    >
      {colors.map((color) => {
        const selected = normalize(color) === normalize(hex);
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={!!selected}
            disabled={disabled}
            onClick={() => setHex(color)}
            className="rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-ring aria-pressed:ring-offset-1 aria-pressed:ring-offset-background"
          >
            <ColorPickerSwatch color={color} className="size-5" />
          </button>
        );
      })}
    </div>
  );
}

export {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerSwatches,
  hexToHsva,
  hsvaToHex,
  hsvaToRgba,
  useColorPicker,
};
export type { Hsva };
