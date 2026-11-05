"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

interface NumberTickerProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The number to show. When it changes, the ticker moves from the old value to the new one. */
  value: number;
  /** `count` counts through the numbers in between; `roll` turns each digit like an odometer. */
  effect?: "count" | "roll";
  /** Where the first animation starts. */
  from?: number;
  /** Milliseconds each animation takes. */
  duration?: number;
  /** Milliseconds before the first animation starts. */
  delay?: number;
  /** Start on mount, or when the number scrolls into view. */
  trigger?: "mount" | "view";
  /** How to write the number: decimals, currency, percent, compact ("1.2K")... */
  format?: Intl.NumberFormatOptions;
  /** The locale for `format`. Defaults to the browser's. */
  locale?: string;
  /** Text before and after the number, such as "+" or " users". */
  prefix?: string;
  suffix?: string;
}

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const DIGITS = "0123456789";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Without decimals in `format`, a fixed number of them: as many as the value has
 * (4.5 counts 0.0, 0.1... 4.5), and at least the format's own (cents for currency).
 */
function formatter(value: number, format: Intl.NumberFormatOptions = {}, locale?: string) {
  const base = new Intl.NumberFormat(locale, format);
  const own =
    format.minimumFractionDigits !== undefined || format.maximumFractionDigits !== undefined;
  if (own || (format.notation ?? "standard") !== "standard") return base;
  // Percent shows the value times 100, so 0.125 needs one decimal, not three.
  const places = (String(value).split(".")[1]?.length ?? 0) - (format.style === "percent" ? 2 : 0);
  const decimals = Math.max(places, base.resolvedOptions().minimumFractionDigits ?? 0);
  return new Intl.NumberFormat(locale, {
    ...format,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** True once the element has been in view; always true when `enabled` is off. */
function useSeen(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [seen, setSeen] = React.useState(!enabled);
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return setSeen(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry!.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return seen;
}

/**
 * A number that counts up to its value, or rolls its digits like an odometer,
 * when it comes into view and whenever the value changes. Screen readers get
 * the final number once, digits keep a fixed width so nothing around it jumps,
 * and with reduced motion turned on the number just shows.
 */
function NumberTicker({
  value,
  effect = "count",
  from = 0,
  duration = 1200,
  delay = 0,
  trigger = "view",
  format,
  locale,
  prefix = "",
  suffix = "",
  className,
  ...props
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const seen = useSeen(ref, trigger === "view");
  // What's on screen: `from` until it starts, then the value.
  const [target, setTarget] = React.useState(from);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!seen) return;
    if (started.current) return setTarget(value);
    // The first time, wait at least a frame, so the starting value is on screen to move from.
    const timer = setTimeout(
      () => {
        started.current = true;
        setTarget(value);
      },
      Math.max(delay, 16),
    );
    return () => clearTimeout(timer);
  }, [seen, value, delay]);

  const fmt = formatter(value, format, locale);
  const final = `${prefix}${fmt.format(value)}${suffix}`;

  return (
    <span
      ref={ref}
      data-slot="number-ticker"
      className={cn("inline-block whitespace-nowrap tabular-nums", className)}
      {...props}
    >
      <span className="sr-only">{final}</span>
      <span aria-hidden>
        {prefix}
        {effect === "roll" ? (
          <RollDigits shape={fmt.format(value)} shown={fmt.format(target)} duration={duration} />
        ) : (
          <CountUp target={target} duration={duration} fmt={fmt} />
        )}
        {suffix}
      </span>
    </span>
  );
}

/** Counts from the number on screen to `target`, easing out. */
function CountUp({
  target,
  duration,
  fmt,
}: {
  target: number;
  duration: number;
  fmt: Intl.NumberFormat;
}) {
  const [shown, setShown] = React.useState(target);
  const current = React.useRef(target);

  React.useEffect(() => {
    const start = current.current;
    if (start === target) return;
    if (reducedMotion()) {
      current.current = target;
      return setShown(target);
    }
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - began) / duration, 1);
      current.current = start + (target - start) * easeOutExpo(t);
      setShown(t === 1 ? target : current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{fmt.format(shown)}</>;
}

/**
 * Each digit is a column of 0 to 9 behind a one-line window; moving the column
 * shows the digit. The columns take the final value's shape from the start, and
 * are matched from the right, so the ones stay the ones and every digit rolls.
 */
function RollDigits({
  shape,
  shown,
  duration,
}: {
  shape: string;
  shown: string;
  duration: number;
}) {
  const chars = [...shape];
  const now = [...shown];
  return (
    <>
      {chars.map((char, i) => {
        const place = chars.length - i;
        if (!DIGITS.includes(char)) return <span key={`${place}-${char}`}>{char}</span>;
        // The digit in the same place of what's on screen; 0 where it's shorter.
        const digit = Math.max(DIGITS.indexOf(now[now.length - place] ?? "0"), 0);
        return (
          <span
            key={place}
            data-slot="number-ticker-digit"
            className="relative inline-block h-[1lh] overflow-hidden align-bottom"
          >
            {/* Holds the width, so the column can sit on top. */}
            <span className="invisible">0</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col motion-reduce:transition-none!"
              style={{
                transform: `translateY(${-digit * 10}%)`,
                transition: `transform ${duration}ms ${EASE_OUT}`,
              }}
            >
              {[...DIGITS].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </>
  );
}

export { NumberTicker, type NumberTickerProps };
