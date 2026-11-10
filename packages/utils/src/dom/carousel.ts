// Carousel: the browser scrolls the slides and snaps them into place, so a
// swipe or a trackpad already works. This adds what Embla gives the React one:
// the previous and next buttons, the arrow keys, buttons that turn off at the
// ends, and dragging with a mouse.

interface Parts {
  root: HTMLElement;
  content: HTMLElement;
  items: HTMLElement[];
  vertical: boolean;
}

function partsOf(el: Element | null): Parts | null {
  const root = el?.closest<HTMLElement>(".cl-carousel");
  const content = root?.querySelector<HTMLElement>(".cl-carousel-content");
  if (!root || !content) return null;
  const items = [...content.querySelectorAll<HTMLElement>(":scope > .cl-carousel-item")];
  return { root, content, items, vertical: root.dataset.orientation === "vertical" };
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Right to left, scrollLeft runs from 0 down to minus the width.
const sign = ({ content, vertical }: Parts) =>
  !vertical && getComputedStyle(content).direction === "rtl" ? -1 : 1;
const position = (parts: Parts) =>
  Math.abs(parts.vertical ? parts.content.scrollTop : parts.content.scrollLeft);
const end = ({ content, vertical }: Parts) =>
  vertical
    ? content.scrollHeight - content.clientHeight
    : content.scrollWidth - content.clientWidth;

/** The distance from one slide's start to the next one's. */
function step({ content, items, vertical }: Parts) {
  const first = items[0];
  if (!first) return 0;
  const style = getComputedStyle(content);
  const gap = parseFloat(vertical ? style.rowGap : style.columnGap) || 0;
  return (vertical ? first.offsetHeight : first.offsetWidth) + gap;
}

function scrollToOffset(parts: Parts, offset: number) {
  const to = Math.min(Math.max(offset, 0), end(parts));
  parts.content.scrollTo({
    [parts.vertical ? "top" : "left"]: to * sign(parts),
    behavior: reducedMotion() ? "instant" : "smooth",
  });
}

// Where each carousel is headed, so pressing twice quickly moves two slides,
// not one and a bit. Cleared once the scrolling stops.
const targets = new WeakMap<HTMLElement, { index: number; timer: number }>();

/** Scrolls one slide back (-1) or on (1). */
function go(parts: Parts, by: number) {
  const size = step(parts);
  if (!size) return;
  const last = Math.round(end(parts) / size);
  const from = targets.get(parts.content)?.index ?? Math.round(position(parts) / size);
  const index = Math.min(Math.max(from + by, 0), last);

  clearTimeout(targets.get(parts.content)?.timer);
  const timer = window.setTimeout(() => targets.delete(parts.content), 700);
  targets.set(parts.content, { index, timer });
  scrollToOffset(parts, index * size);
}

/** Turns the buttons off at the ends, like Embla's canScrollPrev and canScrollNext. */
function update(parts: Parts) {
  const at = position(parts);
  const previous = parts.root.querySelector<HTMLButtonElement>(".cl-carousel-previous");
  const next = parts.root.querySelector<HTMLButtonElement>(".cl-carousel-next");
  if (previous) previous.disabled = at <= 1;
  if (next) next.disabled = at >= end(parts) - 1;
}

/** Makes the slides reachable from the keyboard, labels them, and sets the buttons. */
export function setupCarousels(root: ParentNode = document) {
  const roots = [...root.querySelectorAll<HTMLElement>(".cl-carousel")];
  if (root instanceof HTMLElement && root.matches(".cl-carousel")) roots.push(root);
  for (const el of roots) {
    const parts = partsOf(el);
    if (!parts) continue;
    if (!parts.content.hasAttribute("tabindex")) parts.content.tabIndex = 0;
    parts.items.forEach((item, i) => {
      item.setAttribute("role", "group");
      item.setAttribute("aria-roledescription", "slide");
      if (!item.hasAttribute("aria-label")) {
        item.setAttribute("aria-label", `${i + 1} of ${parts.items.length}`);
      }
    });
    update(parts);
  }
}

export function onCarouselClick(target: Element) {
  const button = target.closest(".cl-carousel-previous, .cl-carousel-next");
  const parts = partsOf(button);
  if (button && parts) go(parts, button.matches(".cl-carousel-next") ? 1 : -1);
}

export function onCarouselKeyDown(event: KeyboardEvent, target: Element) {
  if (target.closest("input, textarea, select, [contenteditable]")) return;
  const parts = partsOf(target);
  if (!parts || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  // Left and right, also when it's vertical, like the React one; swapped right to left.
  const rtl = getComputedStyle(parts.root).direction === "rtl";
  const forward = (event.key === "ArrowRight") !== rtl;
  event.preventDefault();
  go(parts, forward ? 1 : -1);
}

const pending = new WeakSet<HTMLElement>();

/** Scroll events don't bubble, so this listens in the capture phase; one update a frame. */
export function onCarouselScroll(event: Event) {
  const content = event.target;
  if (!(content instanceof HTMLElement) || !content.matches(".cl-carousel-content")) return;
  if (pending.has(content)) return;
  pending.add(content);
  requestAnimationFrame(() => {
    pending.delete(content);
    const parts = partsOf(content);
    if (parts) update(parts);
  });
}

/** A mouse drags the slides; touch screens and trackpads already scroll them. */
export function onCarouselPointerDown(event: PointerEvent, target: Element) {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  const content = target.closest<HTMLElement>(".cl-carousel-content");
  const parts = partsOf(content);
  if (!content || !parts || target.closest("a, button, input, textarea, select, label")) return;

  const axis = parts.vertical ? "scrollTop" : "scrollLeft";
  const start = content[axis];
  const from = parts.vertical ? event.clientY : event.clientX;
  const startIndex = Math.round(position(parts) / (step(parts) || 1));
  let moved = 0;
  // No text selection or image dragging while it moves.
  event.preventDefault();
  const stop = (e: Event) => e.stopPropagation();

  const move = (e: PointerEvent) => {
    moved = (parts.vertical ? e.clientY : e.clientX) - from;
    if (Math.abs(moved) > 3) content.dataset.dragging = "";
    content[axis] = start - moved;
  };
  const up = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    document.removeEventListener("pointercancel", up);
    if (!content.hasAttribute("data-dragging")) return;

    // The click that ends a drag isn't a click.
    document.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => document.removeEventListener("click", stop, true));
    // A fifth of a slide is enough to move on, like a flick.
    const size = step(parts);
    const pulled = -moved * sign(parts);
    const by = Math.abs(pulled) > size / 5 ? Math.sign(pulled) : 0;
    scrollToOffset(parts, (startIndex + by) * size);
    // Snapping comes back once it has slid into place.
    const done = () => delete content.dataset.dragging;
    content.addEventListener("scrollend", done, { once: true });
    setTimeout(done, 600);
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
  document.addEventListener("pointercancel", up);
}
