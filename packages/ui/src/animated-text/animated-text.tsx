"use client";

import * as React from "react";
import { cn } from "@cladux/utils";

type AnimatedTextEffect =
  "fade-up" | "blur-in" | "mask" | "pop" | "typewriter" | "rotate" | "shimmer" | "gradient";

interface AnimatedTextProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The text. Not needed for `rotate`, or for `typewriter` with `phrases`. */
  children?: string;
  effect?: AnimatedTextEffect;
  /** Entrance effects: animate each word, character or line in turn. */
  by?: "word" | "char" | "line";
  /** Start on mount, or when the text scrolls into view. */
  trigger?: "mount" | "view";
  /** With `trigger="view"`: play only the first time it comes into view. */
  once?: boolean;
  /** Milliseconds before it starts. */
  delay?: number;
  /** Entrance effects: milliseconds between one piece and the next. */
  stagger?: number;
  /** Entrance effects: milliseconds each piece takes. */
  duration?: number;
  /** `rotate`: the words to cycle through. */
  words?: string[];
  /** `rotate`: milliseconds each word stays. */
  interval?: number;
  /** `typewriter`: phrases to type and delete in a loop. */
  phrases?: string[];
  /** `typewriter`: milliseconds per character. */
  speed?: number;
  /** `typewriter`: show a blinking cursor. */
  cursor?: boolean;
}

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const KEYFRAMES: Record<"fade-up" | "blur-in" | "mask" | "pop", Keyframe[]> = {
  "fade-up": [
    { opacity: 0, transform: "translateY(0.4em)" },
    { opacity: 1, transform: "none" },
  ],
  "blur-in": [
    { opacity: 0, filter: "blur(10px)" },
    { opacity: 1, filter: "blur(0)" },
  ],
  // The piece sits in a clipping box, so it rises from behind an edge.
  mask: [
    { opacity: 1, transform: "translateY(110%)" },
    { opacity: 1, transform: "none" },
  ],
  pop: [
    { opacity: 0, transform: "scale(0.6)" },
    { opacity: 1, transform: "scale(1.08)", offset: 0.6 },
    { opacity: 1, transform: "none" },
  ],
};

const STAGGER = { word: 80, char: 30, line: 160 };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits text into characters the way people see them, so emoji stay whole. */
function graphemes(text: string) {
  return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(
    (s) => s.segment,
  );
}

/** True once the element is in view; always true when `enabled` is off. */
function useInView(ref: React.RefObject<HTMLElement | null>, enabled: boolean, once: boolean) {
  const [inView, setInView] = React.useState(!enabled);
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return setInView(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry!.isIntersecting);
        if (entry!.isIntersecting && once) observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled, once]);
  return inView;
}

/**
 * Animated headlines and phrases: entrance effects that reveal text word by
 * word, character by character or line by line, plus rotating words, a
 * typewriter, a shimmer and a flowing gradient. The motion runs on the Web
 * Animations API, so there are no keyframes to add, and screen readers get the
 * plain text once. With reduced motion turned on, the text just shows.
 */
function AnimatedText({
  effect = "fade-up",
  children = "",
  by = "word",
  trigger = "view",
  once = true,
  delay = 0,
  stagger,
  duration = 600,
  words = [],
  interval = 2500,
  phrases,
  speed = 50,
  cursor = true,
  ...props
}: AnimatedTextProps) {
  if (effect === "rotate") return <RotateText words={words} interval={interval} {...props} />;
  if (effect === "typewriter") {
    const list = phrases?.length ? phrases : [children];
    return <TypewriterText {...{ list, speed, cursor, delay, trigger, once }} {...props} />;
  }
  if (effect === "shimmer" || effect === "gradient") {
    return (
      <FlowText {...{ effect, delay }} {...props}>
        {children}
      </FlowText>
    );
  }
  return (
    <EntranceText
      {...{ effect, by, trigger, once, delay, duration }}
      stagger={stagger ?? STAGGER[by]}
      {...props}
    >
      {children}
    </EntranceText>
  );
}

type SpanProps = Omit<React.ComponentProps<"span">, "children">;

function EntranceText({
  className,
  children,
  effect,
  by,
  trigger,
  once,
  delay,
  stagger,
  duration,
  ...props
}: SpanProps & {
  children: string;
  effect: keyof typeof KEYFRAMES;
} & Required<
    Pick<AnimatedTextProps, "by" | "trigger" | "once" | "delay" | "stagger" | "duration">
  >) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, trigger === "view", once);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pieces = [...root.querySelectorAll<HTMLElement>("[data-slot=animated-text-piece]")];
    if (reducedMotion() || typeof root.animate !== "function") {
      for (const piece of pieces) piece.style.opacity = "1";
      return;
    }
    // Hidden again until it's in view (and between views, without `once`).
    if (!inView) return;

    // By line: pieces that share a top edge animate together.
    const tops = pieces.map((p) => p.offsetTop);
    const lines = [...new Set(tops)].sort((a, b) => a - b);
    const animations = pieces.map((piece, i) =>
      piece.animate(KEYFRAMES[effect], {
        duration,
        delay: delay + (by === "line" ? lines.indexOf(tops[i]!) : i) * stagger,
        easing: EASE_OUT,
        fill: "both",
      }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [inView, effect, by, delay, stagger, duration, children]);

  const piece = (text: string, key: number) => {
    const inner = (
      <span
        data-slot="animated-text-piece"
        className="inline-block opacity-0 motion-reduce:opacity-100"
      >
        {text}
      </span>
    );
    // Mask: a clipping box around each piece, with room for descenders.
    return (
      <React.Fragment key={key}>
        {effect === "mask" ? (
          <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
            {inner}
          </span>
        ) : (
          inner
        )}
      </React.Fragment>
    );
  };

  const words = children.trim().split(/\s+/);

  return (
    <span data-slot="animated-text" data-effect={effect} className={className} {...props}>
      <span className="sr-only">{children}</span>
      <span ref={ref} aria-hidden>
        {words.map((word, w) => (
          <React.Fragment key={w}>
            {w > 0 && " "}
            {by === "char" ? (
              // Characters of a word stay together, so lines only break between words.
              <span className="inline-block whitespace-nowrap">
                {graphemes(word).map((char, c) => piece(char, c))}
              </span>
            ) : (
              piece(word, w)
            )}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

function RotateText({
  className,
  words,
  interval,
  style,
  ...props
}: SpanProps & { words: string[]; interval: number }) {
  const [index, setIndex] = React.useState(0);
  const [widths, setWidths] = React.useState<number[]>([]);
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);

  React.useEffect(() => {
    if (words.length < 2 || reducedMotion()) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  // The box takes the current word's width, so the sentence around it closes up.
  React.useLayoutEffect(() => {
    const measure = () => setWidths(refs.current.map((el) => el?.offsetWidth ?? 0));
    measure();
    const observer = new ResizeObserver(measure);
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [words]);

  const previous = (index - 1 + words.length) % words.length;

  return (
    <span
      data-slot="animated-text"
      data-effect="rotate"
      className={cn(
        "inline-grid overflow-hidden align-bottom transition-[width] duration-500 ease-out motion-reduce:transition-none",
        className,
      )}
      style={{ width: widths[index] || undefined, ...style }}
      {...props}
    >
      <span className="sr-only">{words.join(", ")}</span>
      {words.map((word, i) => (
        <span
          key={word + i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-hidden
          data-state={
            i === index ? "active" : i === previous && words.length > 1 ? "exit" : "enter"
          }
          className="col-start-1 row-start-1 w-max translate-y-full whitespace-nowrap opacity-0 transition-[translate,opacity] duration-500 ease-out data-[state=active]:translate-y-0 data-[state=active]:opacity-100 data-[state=exit]:-translate-y-full motion-reduce:transition-none"
        >
          {word}
        </span>
      ))}
    </span>
  );
}

function TypewriterText({
  className,
  list,
  speed,
  cursor,
  delay,
  trigger,
  once,
  ...props
}: SpanProps & { list: string[] } & Required<
    Pick<AnimatedTextProps, "speed" | "cursor" | "delay" | "trigger" | "once">
  >) {
  // Restart only when the phrases themselves change, not on every render.
  const key = list.join("\u0000");
  const ref = React.useRef<HTMLSpanElement>(null);
  const cursorRef = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, trigger === "view", once);
  const [shown, setShown] = React.useState("");

  React.useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) return setShown(list[0]!);

    let phrase = 0;
    let count = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const chars = graphemes(list[phrase]!);
      count += deleting ? -1 : 1;
      setShown(chars.slice(0, count).join(""));
      if (!deleting && count === chars.length) {
        // One phrase stays; several are held, deleted and replaced.
        if (list.length === 1) return;
        deleting = true;
        timer = setTimeout(tick, 1600);
      } else if (deleting && count === 0) {
        deleting = false;
        phrase = (phrase + 1) % list.length;
        timer = setTimeout(tick, 400);
      } else {
        timer = setTimeout(tick, deleting ? speed / 2 : speed);
      }
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands for `list`.
  }, [inView, key, speed, delay]);

  React.useEffect(() => {
    const el = cursorRef.current;
    if (!el || typeof el.animate !== "function" || reducedMotion()) return;
    const blink = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 530,
      iterations: Infinity,
      direction: "alternate",
      easing: "steps(1, end)",
    });
    return () => blink.cancel();
  }, [cursor]);

  // The longest phrase holds the space, so nothing around it moves while typing.
  const longest = list.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      ref={ref}
      data-slot="animated-text"
      data-effect="typewriter"
      className={cn("inline-grid", className)}
      {...props}
    >
      <span className="sr-only">{list.join(", ")}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1 text-start">
        {longest}
        {cursor && <span className="inline-block w-[0.08em]" />}
      </span>
      {/* Typed from the start edge, even in centered text. */}
      <span aria-hidden className="col-start-1 row-start-1 text-start">
        {shown}
        {cursor && (
          <span
            ref={cursorRef}
            data-slot="animated-text-cursor"
            className="ml-[0.05em] inline-block h-[1em] w-[0.08em] translate-y-[0.12em] bg-current"
          />
        )}
      </span>
    </span>
  );
}

function FlowText({
  className,
  children,
  effect,
  delay,
  ...props
}: SpanProps & { children: string; effect: "shimmer" | "gradient"; delay: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function" || reducedMotion()) return;
    // The gradient is twice as wide as the text: sliding it one full width loops seamlessly.
    const flow = el.animate(
      effect === "shimmer"
        ? [{ backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0" }]
        : [{ backgroundPosition: "0% 0" }, { backgroundPosition: "200% 0" }],
      { duration: effect === "shimmer" ? 2200 : 6000, delay, iterations: Infinity },
    );
    return () => flow.cancel();
  }, [effect, delay]);

  return (
    <span
      ref={ref}
      data-slot="animated-text"
      data-effect={effect}
      className={cn(
        "box-decoration-clone bg-clip-text text-transparent",
        effect === "shimmer"
          ? "bg-linear-to-r from-muted-foreground from-40% via-foreground via-50% to-muted-foreground to-60% bg-size-[250%_100%] bg-position-[100%_0]"
          : "bg-linear-to-r from-primary via-muted-foreground to-primary bg-size-[200%_100%]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { AnimatedText };
export type { AnimatedTextEffect, AnimatedTextProps };
