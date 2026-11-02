"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Which way the content moves. */
  direction?: "left" | "right" | "up" | "down";
  /** Pixels per second. */
  speed?: number;
  pauseOnHover?: boolean;
  /** Space between items and between repeats, in px. */
  gap?: number;
  /** Fade the edges. */
  fade?: boolean;
}

/**
 * Scrolls its children in an endless loop. The content is repeated as often as
 * needed to fill the container, and the motion uses the Web Animations API, so
 * it needs no CSS keyframes. With reduced motion turned on, it stands still.
 */
function Marquee({
  className,
  direction = "left",
  speed = 40,
  pauseOnHover = true,
  gap = 16,
  fade = true,
  children,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down";
  const rootRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const firstRef = React.useRef<HTMLDivElement>(null);
  const animation = React.useRef<Animation | null>(null);
  const [copies, setCopies] = React.useState(2);
  const [size, setSize] = React.useState(0);

  // Measure one copy and the container, and repeat enough copies to cover it.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const first = firstRef.current;
    if (!root || !first) return;
    const measure = () => {
      const one = vertical ? first.offsetHeight : first.offsetWidth;
      const space = vertical ? root.clientHeight : root.clientWidth;
      if (!one) return;
      setSize(one + gap);
      setCopies(Math.max(2, Math.ceil(space / (one + gap)) + 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(first);
    return () => observer.disconnect();
  }, [vertical, gap]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || !size || typeof track.animate !== "function") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rtl = getComputedStyle(track).direction === "rtl";

    const start = () => {
      animation.current?.cancel();
      animation.current = null;
      if (reduced.matches) return;
      const axis = vertical ? "Y" : "X";
      // Moving left or up runs 0 -> -size; right or down runs the other way.
      let backwards = direction === "right" || direction === "down";
      if (rtl && !vertical) backwards = !backwards;
      const from = `translate${axis}(${backwards ? -size : 0}px)`;
      const to = `translate${axis}(${backwards ? 0 : -size}px)`;
      animation.current = track.animate([{ transform: from }, { transform: to }], {
        duration: (size / speed) * 1000,
        iterations: Infinity,
      });
    };
    start();
    reduced.addEventListener("change", start);
    return () => {
      reduced.removeEventListener("change", start);
      animation.current?.cancel();
      animation.current = null;
    };
  }, [size, speed, direction, vertical]);

  const pause = () => pauseOnHover && animation.current?.pause();
  const play = () => animation.current?.play();

  const mask = fade
    ? `linear-gradient(to ${vertical ? "bottom" : "right"}, transparent, #000 10%, #000 90%, transparent)`
    : undefined;

  return (
    <div
      ref={rootRef}
      data-slot="marquee"
      data-direction={direction}
      className={cn(
        "group/marquee relative flex overflow-hidden data-[direction=down]:flex-col data-[direction=up]:flex-col",
        className,
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType === "mouse") pause();
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        play();
      }}
      // Keyboard users can stop it by focusing a link inside.
      onFocus={(e) => {
        onFocus?.(e);
        pause();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        play();
      }}
      {...props}
    >
      <div
        ref={trackRef}
        data-slot="marquee-track"
        className="flex shrink-0 will-change-transform group-data-[direction=down]/marquee:flex-col group-data-[direction=up]/marquee:flex-col"
        style={{ gap }}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstRef : undefined}
            data-slot="marquee-content"
            aria-hidden={i > 0 || undefined}
            // Repeats are hidden from screen readers and can't be tabbed to.
            inert={i > 0 || undefined}
            className="flex shrink-0 items-center group-data-[direction=down]/marquee:flex-col group-data-[direction=up]/marquee:flex-col"
            style={{ gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Marquee };
export type { MarqueeProps };
