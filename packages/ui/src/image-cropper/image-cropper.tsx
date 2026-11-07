"use client";

import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";
import { useControllableState } from "../hooks/use-controllable-state";
import { Slider } from "../slider/slider";

/** The part of the image inside the frame, in the image's own pixels. */
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropExportOptions {
  /** "image/png" (the default), "image/jpeg" or "image/webp". */
  type?: string;
  /** For JPEG and WebP, from 0 to 1. */
  quality?: number;
  /** The width of the exported image. Defaults to the crop's own size. */
  width?: number;
  /** Cut the corners off as a circle, for avatars. Needs a type with transparency (PNG or WebP). */
  round?: boolean;
}

/** What a `ref` on ImageCropper gives you. */
interface ImageCropperHandle {
  /** The current crop, or null before the image has loaded. */
  getCrop: () => CropArea | null;
  toBlob: (options?: CropExportOptions) => Promise<Blob | null>;
  toDataURL: (options?: CropExportOptions) => string | null;
  /** Back to the start: no zoom, centered. */
  reset: () => void;
}

interface ImageCropperProps extends Omit<React.ComponentProps<"div">, "ref" | "children"> {
  ref?: React.Ref<ImageCropperHandle>;
  src: string;
  alt?: string;
  /** Width divided by height of the crop, e.g. `1` or `16 / 9`. */
  aspect?: number;
  /** A circle shows where the corners will be cut, for avatars. */
  shape?: "rect" | "round";
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  /** Called after each move or zoom ends, with the crop in the image's pixels. */
  onCropComplete?: (area: CropArea) => void;
  /** Show the zoom slider. */
  controls?: boolean;
  /** Show rule-of-thirds lines while the image moves. */
  grid?: boolean;
  /** For images on another site: "anonymous" lets you export them, if the site allows it. */
  crossOrigin?: "anonymous" | "use-credentials";
  disabled?: boolean;
  /** What screen readers call the cropper. */
  label?: string;
}

/** Room between the frame and the edge of the box, in pixels. */
const MARGIN = 24;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Draws a crop of an image onto a new canvas. */
function drawCrop(image: HTMLImageElement, area: CropArea, options: CropExportOptions = {}) {
  const width = Math.round(options.width ?? area.width);
  const height = Math.round((width * area.height) / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  if (options.round) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);
  return canvas;
}

/**
 * Crops an image: a frame in the middle, with the image moved and zoomed under
 * it. Drag to move, scroll or pinch to zoom, or use the keyboard. Export the
 * crop as a PNG, JPEG or WebP through a ref, or use `onCropComplete` with your
 * own code or a server.
 */
function ImageCropper({
  ref,
  src,
  alt = "",
  aspect = 1,
  shape = "rect",
  zoom: zoomProp,
  defaultZoom = 1,
  onZoomChange,
  minZoom = 1,
  maxZoom = 4,
  onCropComplete,
  controls = true,
  grid = true,
  crossOrigin,
  disabled,
  label = "Image cropper. Drag or use the arrow keys to move the image, and scroll or press plus and minus to zoom.",
  className,
  ...props
}: ImageCropperProps) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [box, setBox] = React.useState({ width: 0, height: 0 });
  const [natural, setNatural] = React.useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoomState] = useControllableState({
    value: zoomProp,
    defaultValue: defaultZoom,
    onChange: onZoomChange,
  });
  // Where the image's center is, in pixels from the frame's center.
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [moving, setMoving] = React.useState(false);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const pinch = React.useRef<{ distance: number; zoom: number } | null>(null);

  // The frame: as big as the box allows, at the aspect ratio.
  const frame = React.useMemo(() => {
    const maxWidth = Math.max(box.width - MARGIN * 2, 0);
    const maxHeight = Math.max(box.height - MARGIN * 2, 0);
    const width = Math.min(maxWidth, maxHeight * aspect);
    return { width, height: width / aspect };
  }, [box, aspect]);

  // At zoom 1, the image just covers the frame.
  const baseScale = natural
    ? Math.max(frame.width / natural.width, frame.height / natural.height)
    : 0;

  /** Keeps the frame covered: the image can't move past its own edges. */
  const clampOffset = React.useCallback(
    (next: { x: number; y: number }, z: number) => {
      if (!natural) return next;
      const maxX = Math.max((natural.width * baseScale * z - frame.width) / 2, 0);
      const maxY = Math.max((natural.height * baseScale * z - frame.height) / 2, 0);
      return { x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
    },
    [natural, baseScale, frame],
  );

  const getCrop = React.useCallback((): CropArea | null => {
    if (!natural || !baseScale) return null;
    const scale = baseScale * zoom;
    const width = Math.min(frame.width / scale, natural.width);
    const height = Math.min(frame.height / scale, natural.height);
    const x = (natural.width * scale - frame.width) / 2 - offset.x;
    const y = (natural.height * scale - frame.height) / 2 - offset.y;
    return {
      x: Math.round(clamp(x / scale, 0, natural.width - width)),
      y: Math.round(clamp(y / scale, 0, natural.height - height)),
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [natural, baseScale, zoom, frame, offset]);

  /** Zooms toward a point given in pixels from the frame's center, so it stays under the pointer. */
  const zoomTo = (next: number, at = { x: 0, y: 0 }) => {
    const z = clamp(next, minZoom, maxZoom);
    const ratio = z / zoom;
    setZoomState(z);
    setOffset((o) =>
      clampOffset({ x: at.x - (at.x - o.x) * ratio, y: at.y - (at.y - o.y) * ratio }, z),
    );
  };

  // Keep the image covering the frame when the box, the aspect or the zoom changes.
  React.useEffect(() => setOffset((o) => clampOffset(o, zoom)), [clampOffset, zoom]);

  // Tell the parent once things settle.
  const complete = React.useRef(onCropComplete);
  complete.current = onCropComplete;
  React.useEffect(() => {
    if (moving) return;
    const area = getCrop();
    if (!area) return;
    const timer = setTimeout(() => complete.current?.(area), 150);
    return () => clearTimeout(timer);
  }, [getCrop, moving]);

  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry!.contentRect.width, height: entry!.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A new image starts over. One that loaded before React did (from the cache,
  // or while the page hydrated) has already fired its load event, so check it here.
  React.useEffect(() => {
    const image = imageRef.current;
    setNatural(
      image?.complete && image.naturalWidth
        ? { width: image.naturalWidth, height: image.naturalHeight }
        : null,
    );
    setOffset({ x: 0, y: 0 });
  }, [src]);

  // Wheel zoom needs a non-passive listener to stop the page from scrolling.
  const wheel = React.useRef<(event: WheelEvent) => void>(undefined);
  wheel.current = (event) => {
    if (disabled || !natural) return;
    event.preventDefault();
    const rect = boxRef.current!.getBoundingClientRect();
    zoomTo(zoom * Math.exp(-event.deltaY * 0.002), {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    });
  };
  React.useEffect(() => {
    const el = boxRef.current;
    const listener = (event: WheelEvent) => wheel.current?.(event);
    el?.addEventListener("wheel", listener, { passive: false });
    return () => el?.removeEventListener("wheel", listener);
  }, []);

  const center = (rect: DOMRect, p: { x: number; y: number }) => ({
    x: p.x - rect.left - rect.width / 2,
    y: p.y - rect.top - rect.height / 2,
  });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !natural || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
    setMoving(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(event.pointerId);
    if (!last) return;
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 2 && pinch.current) {
      // Two fingers: zoom by how far apart they are, around the point between them.
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      const rect = event.currentTarget.getBoundingClientRect();
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo(
        (pinch.current.zoom * distance) / pinch.current.distance,
        center(rect, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
      );
      return;
    }
    setOffset((o) => clampOffset({ x: o.x + point.x - last.x, y: o.y + point.y - last.y }, zoom));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setMoving(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || !natural) return;
    const step = event.shiftKey ? 50 : 10;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (event.key in moves) {
      // The arrows move the crop, so the image goes the other way.
      const [dx, dy] = moves[event.key]!;
      setOffset((o) => clampOffset({ x: o.x + dx, y: o.y + dy }, zoom));
    } else if (event.key === "+" || event.key === "=") zoomTo(zoom + 0.1);
    else if (event.key === "-" || event.key === "_") zoomTo(zoom - 0.1);
    else if (event.key === "0") zoomTo(minZoom);
    else return;
    event.preventDefault();
  };

  React.useImperativeHandle(ref, () => ({
    getCrop,
    toBlob: (options) => {
      const area = getCrop();
      const image = imageRef.current;
      if (!area || !image) return Promise.resolve(null);
      const canvas = drawCrop(image, area, options);
      return new Promise((resolve) => canvas.toBlob(resolve, options?.type, options?.quality));
    },
    toDataURL: (options) => {
      const area = getCrop();
      const image = imageRef.current;
      if (!area || !image) return null;
      return drawCrop(image, area, options).toDataURL(options?.type, options?.quality);
    },
    reset: () => {
      setZoomState(minZoom);
      setOffset({ x: 0, y: 0 });
    },
  }));

  const imageWidth = natural ? natural.width * baseScale : 0;
  const imageHeight = natural ? natural.height * baseScale : 0;

  return (
    <div
      data-slot="image-cropper"
      data-disabled={disabled || undefined}
      className={cn("flex w-full flex-col gap-3 data-disabled:opacity-50", className)}
      {...props}
    >
      <div
        ref={boxRef}
        role="group"
        aria-label={label}
        aria-roledescription="image cropper"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        data-slot="image-cropper-area"
        className={cn(
          "relative h-72 touch-none overflow-hidden rounded-xl bg-muted outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
          disabled ? "cursor-not-allowed" : "cursor-move",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          crossOrigin={crossOrigin}
          draggable={false}
          onLoad={(event) =>
            setNatural({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
          data-slot="image-cropper-image"
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 max-w-none origin-center",
            !natural && "invisible",
          )}
          style={{
            width: imageWidth || undefined,
            height: imageHeight || undefined,
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        />
        <div
          aria-hidden
          data-slot="image-cropper-frame"
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 shadow-[0_0_0_9999px] ring-2 shadow-background/70 ring-background",
            shape === "round" ? "rounded-full" : "rounded-sm",
          )}
          style={{ width: frame.width, height: frame.height }}
        >
          {grid && (
            <div
              data-slot="image-cropper-grid"
              data-visible={moving || undefined}
              className={cn(
                "absolute inset-0 overflow-hidden opacity-0 transition-opacity data-visible:opacity-100",
                shape === "round" ? "rounded-full" : "rounded-sm",
              )}
            >
              <div className="absolute inset-y-0 left-1/3 w-px bg-background/60" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-background/60" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-background/60" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-background/60" />
            </div>
          )}
        </div>
      </div>
      {controls && (
        <div
          data-slot="image-cropper-controls"
          className="flex items-center gap-3 text-muted-foreground"
        >
          <ZoomOutIcon aria-hidden className="size-4 shrink-0" />
          <Slider
            aria-label="Zoom"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={[zoom]}
            onValueChange={([value]) => {
              setMoving(true);
              zoomTo(value!);
            }}
            onValueCommit={() => setMoving(false)}
            disabled={disabled || !natural}
          />
          <ZoomInIcon aria-hidden className="size-4 shrink-0" />
        </div>
      )}
    </div>
  );
}

export {
  ImageCropper,
  type CropArea,
  type CropExportOptions,
  type ImageCropperHandle,
  type ImageCropperProps,
};
