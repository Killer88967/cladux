"use client";

import * as React from "react";
import { cn } from "@cladux/utils";
import { useControllableState } from "../hooks/use-controllable-state";

/** Someone (or something) that can be mentioned. */
interface MentionItem {
  id: string;
  /** What's written after the trigger, e.g. "Ada Lovelace" for "@Ada Lovelace". */
  label: string;
  description?: string;
  avatar?: string;
}

type MentionSource = MentionItem[] | ((query: string) => MentionItem[] | Promise<MentionItem[]>);

interface MentionInputProps extends Omit<
  React.ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The people to suggest: a list, or a function that searches, sync or async. */
  items: MentionSource;
  /** Called with the mentioned items whenever they change. */
  onMentionsChange?: (mentions: MentionItem[]) => void;
  /** The character that starts a mention. */
  trigger?: string;
  /** How many suggestions show at once. */
  limit?: number;
  /** Shown when nothing matches. */
  emptyText?: string;
}

interface Suggesting {
  /** Where the trigger is in the text. */
  start: number;
  query: string;
}

/** The items a list matches for a query: names that start with it first. */
function filter(items: MentionItem[], query: string) {
  const q = query.toLowerCase();
  const starts = items.filter((i) => i.label.toLowerCase().startsWith(q));
  const contains = items.filter((i) => !starts.includes(i) && i.label.toLowerCase().includes(q));
  return [...starts, ...contains];
}

/** Each mention in the text: where it starts and ends, and who it is. */
function findMentions(text: string, trigger: string, known: Map<string, MentionItem>) {
  const found: { start: number; end: number; item: MentionItem }[] = [];
  // Longest names first, so "@Ada Lovelace" wins over "@Ada".
  const labels = [...known.keys()].sort((a, b) => b.length - a.length);
  for (let i = text.indexOf(trigger); i !== -1; i = text.indexOf(trigger, i + 1)) {
    if (i > 0 && !/\s|\(/.test(text[i - 1]!)) continue;
    const rest = text.slice(i + trigger.length);
    const label = labels.find(
      (l) => rest.startsWith(l) && !/[\p{L}\p{N}_]/u.test(rest[l.length] ?? " "),
    );
    if (!label) continue;
    const end = i + trigger.length + label.length;
    found.push({ start: i, end, item: known.get(label)! });
    i = end - 1;
  }
  return found;
}

/**
 * A textarea that suggests people when you type @. Mentions are highlighted
 * and stay plain text in the value ("Thanks @Ada Lovelace!"); a mention
 * counts as long as its name is intact. The suggestions work from the
 * keyboard, like a combobox.
 */
function MentionInput({
  value,
  defaultValue = "",
  onValueChange,
  items,
  onMentionsChange,
  trigger = "@",
  limit = 6,
  emptyText = "No one found",
  className,
  disabled,
  onKeyDown,
  onScroll,
  onBlur,
  ...props
}: MentionInputProps) {
  const id = React.useId();
  const textarea = React.useRef<HTMLTextAreaElement>(null);
  const backdrop = React.useRef<HTMLDivElement>(null);
  const marker = React.useRef<HTMLSpanElement>(null);
  const [text, setText] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [suggesting, setSuggesting] = React.useState<Suggesting | null>(null);
  const [results, setResults] = React.useState<MentionItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [position, setPosition] = React.useState({ left: 0, top: 0 });

  // Everyone a mention can point at: the list, plus anyone picked from a search.
  const picked = React.useRef(new Map<string, MentionItem>());
  const known = React.useMemo(() => {
    const map = new Map(picked.current);
    if (Array.isArray(items)) for (const item of items) map.set(item.label, item);
    return map;
  }, [items, text]);
  const mentions = React.useMemo(() => findMentions(text, trigger, known), [text, trigger, known]);

  // Tell the parent when the people mentioned change.
  const mentionKey = mentions.map((m) => m.item.id).join("\0");
  const notify = React.useRef(onMentionsChange);
  notify.current = onMentionsChange;
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current && !mentionKey) return;
    first.current = false;
    const unique = [...new Map(mentions.map((m) => [m.item.id, m.item])).values()];
    notify.current?.(unique);
  }, [mentionKey]);

  /** Opens, updates or closes the suggestions for where the caret is. */
  const update = (el: HTMLTextAreaElement) => {
    const caret = el.selectionStart;
    if (caret !== el.selectionEnd) return setSuggesting(null);
    const before = el.value.slice(0, caret);
    const start = before.lastIndexOf(trigger);
    const query = before.slice(start + trigger.length);
    const valid =
      start !== -1 &&
      (start === 0 || /\s|\(/.test(before[start - 1]!)) &&
      !/[\n\r]/.test(query) &&
      query.length <= 40 &&
      // After a finished mention, don't suggest again.
      !mentions.some((m) => m.start === start);
    setSuggesting(valid ? { start, query } : null);
  };

  // Look up the suggestions. A slow search that comes back late is ignored.
  React.useEffect(() => {
    if (!suggesting) return;
    let current = true;
    const found = Array.isArray(items) ? filter(items, suggesting.query) : items(suggesting.query);
    if (found instanceof Promise) {
      setLoading(true);
      found.then((list) => current && setResults(list)).finally(() => current && setLoading(false));
    } else {
      setLoading(false);
      setResults(found);
    }
    setActive(0);
    return () => {
      current = false;
    };
  }, [suggesting?.start, suggesting?.query, items]);

  // A name with a space typed after it and no matches: it wasn't a mention.
  const shown = results.slice(0, limit);
  const open = !!suggesting && !(shown.length === 0 && !loading && / $/.test(suggesting.query));

  // Place the list under the trigger, using the marker in the backdrop.
  React.useLayoutEffect(() => {
    if (!open || !marker.current || !textarea.current) return;
    const el = textarea.current;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const left = Math.min(marker.current.offsetLeft, el.clientWidth - 224);
    setPosition({
      left: Math.max(left, 0),
      top: marker.current.offsetTop - el.scrollTop + lineHeight + 4,
    });
  }, [open, suggesting?.start, text]);

  const select = (item: MentionItem) => {
    const el = textarea.current;
    if (!el || !suggesting) return;
    picked.current.set(item.label, item);
    const caret = el.selectionStart;
    const after = text.slice(caret);
    const insert = `${trigger}${item.label}${after.startsWith(" ") ? "" : " "}`;
    const next = text.slice(0, suggesting.start) + insert + after;
    setText(next);
    setSuggesting(null);
    caretAfterRender.current = suggesting.start + insert.length + (after.startsWith(" ") ? 1 : 0);
  };

  // Put the caret after a picked name as soon as the new text is in the textarea.
  const caretAfterRender = React.useRef<number | null>(null);
  React.useLayoutEffect(() => {
    const at = caretAfterRender.current;
    if (at === null || !textarea.current) return;
    caretAfterRender.current = null;
    textarea.current.focus();
    textarea.current.setSelectionRange(at, at);
  }, [text]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !open || event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!shown.length) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + shown.length) % shown.length);
    } else if ((event.key === "Enter" || event.key === "Tab") && shown[active]) {
      event.preventDefault();
      select(shown[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSuggesting(null);
    }
  };

  // The backdrop: the same text, with the mentions highlighted and a marker at the trigger.
  const parts: React.ReactNode[] = [];
  let at = 0;
  const markAt = open ? suggesting.start : -1;
  const plain = (from: number, to: number) => {
    if (markAt >= from && markAt < to) {
      parts.push(
        text.slice(from, markAt),
        <span key="marker" ref={marker} />,
        text.slice(markAt, to),
      );
    } else parts.push(text.slice(from, to));
  };
  for (const m of mentions) {
    plain(at, m.start);
    parts.push(
      <mark
        key={m.start}
        data-slot="mention-input-mention"
        className="rounded-sm bg-primary/15 text-transparent"
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    at = m.end;
  }
  plain(at, text.length);
  if (markAt === text.length) parts.push(<span key="marker" ref={marker} />);

  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-option-${i}`;

  // The textarea and the backdrop share these, so the text lines up exactly.
  const textClass = "px-2.5 py-2 text-base md:text-sm break-words whitespace-pre-wrap";

  return (
    <div
      data-slot="mention-input"
      className={cn("relative w-full rounded-lg dark:bg-input/30", className)}
    >
      <div
        ref={backdrop}
        aria-hidden
        data-slot="mention-input-backdrop"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-lg border border-transparent text-transparent",
          textClass,
        )}
      >
        {parts}
        {/* Keeps a trailing newline from collapsing. */}
        {"​"}
      </div>
      <textarea
        ref={textarea}
        data-slot="mention-input-textarea"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && shown[active] ? optionId(active) : undefined}
        disabled={disabled}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          update(event.target);
        }}
        onSelect={(event) => update(event.currentTarget)}
        onKeyDown={handleKeyDown}
        onScroll={(event) => {
          onScroll?.(event);
          if (backdrop.current) backdrop.current.scrollTop = event.currentTarget.scrollTop;
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setSuggesting(null);
        }}
        className={cn(
          "relative flex field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-transparent transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          textClass,
        )}
        {...props}
      />
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          data-slot="mention-input-list"
          className="absolute z-50 w-56 animate-in overflow-hidden rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 fade-in-0 zoom-in-95"
          style={{ left: position.left, top: position.top }}
          // Keep the textarea focused when the list is clicked.
          onMouseDown={(event) => event.preventDefault()}
        >
          {shown.length === 0 ? (
            <div className="px-2 py-1.5 text-muted-foreground">
              {loading ? "Searching…" : emptyText}
            </div>
          ) : (
            shown.map((item, i) => (
              <div
                key={item.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                data-slot="mention-input-option"
                className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
                onMouseEnter={() => setActive(i)}
                onClick={() => select(item)}
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                  >
                    {item.label.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{item.label}</span>
                  {item.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { MentionInput, type MentionInputProps, type MentionItem, type MentionSource };
