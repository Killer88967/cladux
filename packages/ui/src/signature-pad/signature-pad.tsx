"use client";

import { EraserIcon, Undo2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import { Button } from "../button/button";

/** A point of a stroke: where it was, and how wide the line is there. */
interface Point {
  x: number;
  y: number;
  width: number;
  time: number;
}

/** What a `ref` on SignaturePad gives you. */
interface SignaturePadHandle {
  /** True when nothing has been drawn. */
  isEmpty: () => boolean;
  clear: () => void;
  /** Removes the last stroke. */
  undo: () => void;
  /** The signature as a PNG data URL, cropped to the ink, on a transparent background. */
  toPNG: () => string | null;
  /** The signature as an SVG string, cropped to the ink. */
  toSVG: () => string | null;
}

interface SignaturePadProps extends Omit<
  React.ComponentProps<"div">,
  "ref" | "onChange" | "defaultValue"
> {
  ref?: React.Ref<SignaturePadHandle>;
  /** The ink color. Defaults to the text color, so it follows dark mode. */
  color?: string;
  /** The line's width in pixels, before pressure and speed change it. */
  strokeWidth?: number;
  /** The hint shown while it's empty. */
  placeholder?: string;
  /** Show the Undo and Clear buttons. */
  controls?: boolean;
  /** Sends the signature with a form, as a PNG data URL, under this name. */
  name?: string;
  disabled?: boolean;
  /** Called after every stroke, undo and clear, with the PNG, or null when it's empty. */
  onValueChange?: (png: string | null) => void;
  /** What screen readers call the pad. */
  label?: string;
}

const PAD = 8;

/** The width for a new point: pressure for pens, speed for mice and fingers. */
function widthAt(event: PointerEvent, x: number, y: number, last: Point | undefined, base: number) {
  if (event.pointerType === "pen" && event.pressure > 0) return base * (0.4 + event.pressure * 1.2);
  if (!last) return base;
  const speed = Math.hypot(x - last.x, y - last.y) / Math.max(event.timeStamp - last.time, 1);
  // Faster strokes draw thinner lines, like ink. Blend with the last width so it changes smoothly.
  const target = base * Math.max(0.5, 1.5 - Math.min(speed, 2.5) * 0.4);
  return last.width * 0.7 + target * 0.3;
}

/**
 * The curve from the middle of one segment to the middle of the next, with the
 * point in between as the control: smooth lines from a handful of points.
 */
function segments(stroke: Point[]) {
  if (stroke.length === 1) {
    const [p] = stroke as [Point];
    return [{ from: p, control: p, to: p, width: p.width }];
  }
  const mid = (a: Point, b: Point) => ({ ...b, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return stroke.slice(1).map((point, i) => {
    const prev = stroke[i]!;
    const next = stroke[i + 2];
    return {
      from: i === 0 ? prev : mid(stroke[i - 1]!, prev),
      control: prev,
      to: next ? mid(point, next) : point,
      width: (prev.width + point.width) / 2,
    };
  });
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Point[], fromSegment = 0) {
  for (const s of segments(stroke).slice(fromSegment)) {
    ctx.beginPath();
    ctx.lineWidth = s.width;
    ctx.moveTo(s.from.x, s.from.y);
    ctx.quadraticCurveTo(s.control.x, s.control.y, s.to.x, s.to.y);
    if (s.from === s.to) ctx.lineTo(s.to.x + 0.01, s.to.y);
    ctx.stroke();
  }
}

/** The box around all the ink, with a little room. */
function bounds(strokes: Point[][]) {
  const points = strokes.flat();
  const pad = (p: Point) => p.width / 2 + PAD;
  const left = Math.min(...points.map((p) => p.x - pad(p)));
  const top = Math.min(...points.map((p) => p.y - pad(p)));
  const right = Math.max(...points.map((p) => p.x + pad(p)));
  const bottom = Math.max(...points.map((p) => p.y + pad(p)));
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * A pad to sign with a mouse, a finger or a pen. Lines get thinner as you
 * move faster, and follow pen pressure. Export the signature as a PNG or an
 * SVG, cropped to the ink, or send it with a form through `name`.
 */
function SignaturePad({
  ref,
  color,
  strokeWidth = 2.5,
  placeholder = "Sign here",
  controls = true,
  name,
  disabled,
  onValueChange,
  label = "Signature pad. Draw your signature with a mouse, a finger or a pen.",
  className,
  ...props
}: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const strokes = React.useRef<Point[][]>([]);
  // The pointer that's drawing, and where the canvas is on screen.
  const drawing = React.useRef<{ id: number; box: DOMRect } | null>(null);
  const [empty, setEmpty] = React.useState(true);
  const [png, setPng] = React.useState("");

  const ink = () => color ?? getComputedStyle(canvasRef.current!).color;

  const context = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return null;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ink();
    ctx.fillStyle = ink();
    return ctx;
  };

  /** Sizes the canvas to its box at the screen's pixel density, and draws everything again. */
  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = context();
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    for (const stroke of strokes.current) drawStroke(ctx, stroke);
  }, [color]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    // The ink follows the text color, so draw again when the theme changes.
    const theme = new MutationObserver(redraw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => {
      observer.disconnect();
      theme.disconnect();
    };
  }, [redraw]);

  const toPNG = () => {
    if (!strokes.current.length) return null;
    const box = bounds(strokes.current);
    const ratio = 2;
    const out = document.createElement("canvas");
    out.width = Math.ceil(box.width * ratio);
    out.height = Math.ceil(box.height * ratio);
    const ctx = out.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.translate(-box.left, -box.top);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ink();
    for (const stroke of strokes.current) drawStroke(ctx, stroke);
    return out.toDataURL("image/png");
  };

  const toSVG = () => {
    if (!strokes.current.length) return null;
    const box = bounds(strokes.current);
    const n = (v: number) => Math.round(v * 100) / 100;
    const paths = strokes.current.flatMap((stroke) =>
      segments(stroke).map(
        (s) =>
          `<path d="M${n(s.from.x - box.left)} ${n(s.from.y - box.top)}Q${n(s.control.x - box.left)} ${n(s.control.y - box.top)} ${n(s.to.x - box.left)} ${n(s.to.y - box.top)}" stroke-width="${n(s.width)}"/>`,
      ),
    );
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(box.width)}" height="${n(box.height)}" viewBox="0 0 ${n(box.width)} ${n(box.height)}" fill="none" stroke="${ink()}" stroke-linecap="round" stroke-linejoin="round">${paths.join("")}</svg>`;
  };

  /** Tells the form and the callback after the strokes change. */
  const changed = () => {
    const next = toPNG();
    setEmpty(!next);
    setPng(next ?? "");
    onValueChange?.(next);
  };

  const clear = () => {
    strokes.current = [];
    redraw();
    changed();
  };

  const undo = () => {
    strokes.current = strokes.current.slice(0, -1);
    redraw();
    changed();
  };

  React.useImperativeHandle(ref, () => ({
    isEmpty: () => !strokes.current.length,
    clear,
    undo,
    toPNG,
    toSVG,
  }));

  /** Adds the point under a pointer event to the stroke being drawn. */
  const addPoint = (event: PointerEvent, stroke: Point[], box: DOMRect) => {
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const last = stroke.at(-1);
    // Skip points too close to the last one: they only add noise.
    if (last && Math.hypot(x - last.x, y - last.y) < 1.5) return;
    stroke.push({ x, y, width: widthAt(event, x, y, last, strokeWidth), time: event.timeStamp });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const box = event.currentTarget.getBoundingClientRect();
    drawing.current = { id: event.pointerId, box };
    const stroke: Point[] = [];
    addPoint(event.nativeEvent, stroke, box);
    strokes.current.push(stroke);
    const ctx = context();
    if (ctx) drawStroke(ctx, stroke);
    setEmpty(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = drawing.current;
    if (state?.id !== event.pointerId) return;
    const stroke = strokes.current.at(-1)!;
    const before = segments(stroke).length;
    // Coalesced events catch every point the pointer passed, not just one per frame.
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const e of events.length ? events : [event.nativeEvent]) addPoint(e, stroke, state.box);
    // Draw from the segment the new points just finished smoothing.
    const ctx = context();
    if (ctx) drawStroke(ctx, stroke, Math.max(before - 1, 0));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawing.current?.id !== event.pointerId) return;
    drawing.current = null;
    redraw();
    changed();
  };

  return (
    <div
      data-slot="signature-pad"
      data-disabled={disabled || undefined}
      className={cn(
        "relative h-44 w-full overflow-hidden rounded-lg border bg-background text-foreground data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-10 flex items-end gap-2 border-b border-dashed border-border pb-1 text-muted-foreground"
      >
        <span className="text-lg leading-none">×</span>
      </div>
      {empty && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"
        >
          {placeholder}
        </span>
      )}
      <canvas
        ref={canvasRef}
        data-slot="signature-pad-canvas"
        role="img"
        aria-label={label}
        className={cn(
          "absolute inset-0 size-full touch-none",
          disabled ? "cursor-not-allowed" : "cursor-crosshair",
        )}
        style={color ? { color } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {controls && (
        <div data-slot="signature-pad-controls" className="absolute end-2 top-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Undo"
            disabled={disabled || empty}
            onClick={undo}
          >
            <Undo2Icon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear"
            disabled={disabled || empty}
            onClick={clear}
          >
            <EraserIcon />
          </Button>
        </div>
      )}
      {name && <input type="hidden" name={name} value={png} />}
    </div>
  );
}

export { SignaturePad, type SignaturePadHandle, type SignaturePadProps };
