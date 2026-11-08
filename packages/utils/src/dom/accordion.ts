// The Accordion opens and closes without this: it's native <details>, and CSS
// slides it open. Safari can't slide it shut, though, because it hides a closed
// <details> straight away. So this keeps the item open while the content
// shrinks to nothing, the same 200ms ease-out as the CSS, and closes it after.

const closing = new WeakMap<HTMLDetailsElement, { animation: Animation; name: string | null }>();

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function close(item: HTMLDetailsElement) {
  const content = item.querySelector<HTMLElement>(":scope > .cl-accordion-content");
  if (!content || reducedMotion()) {
    item.open = false;
    return;
  }

  const name = item.getAttribute("name");
  item.removeAttribute("name");
  item.dataset.closing = "";

  const animation = content.animate([{ height: `${content.offsetHeight}px` }, { height: "0px" }], {
    duration: 200,
    easing: "ease-out",
    fill: "forwards",
  });
  closing.set(item, { animation, name });

  animation.onfinish = () => {
    item.open = false;
    animation.cancel();
    finish(item);
  };
}

function finish(item: HTMLDetailsElement) {
  const state = closing.get(item);
  if (!state) return;
  closing.delete(item);
  if (state.name !== null) item.setAttribute("name", state.name);
  requestAnimationFrame(() => delete item.dataset.closing);
}

export function onAccordionClick(event: MouseEvent, target: Element) {
  const trigger = target.closest(".cl-accordion-trigger");
  const item = trigger?.parentElement;
  if (!(item instanceof HTMLDetailsElement) || !item.matches(".cl-accordion-item")) return;
  if (trigger !== item.querySelector(":scope > summary")) return;

  const state = closing.get(item);
  if (state) {
    event.preventDefault();
    state.animation.cancel();
    finish(item);
    return;
  }

  if (item.open) {
    event.preventDefault();
    close(item);
    return;
  }

  const name = item.getAttribute("name");
  if (!name) return;
  for (const other of document.querySelectorAll<HTMLDetailsElement>(
    "details.cl-accordion-item[open]",
  )) {
    if (other !== item && other.getAttribute("name") === name) close(other);
  }
}
