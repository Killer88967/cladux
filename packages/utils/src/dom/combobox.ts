import { place } from "./position";

// Combobox: a text input that filters a list as you type. Like the React one
// (Base UI): clicking the input, the chevron or pressing an arrow key opens
// the list with every item; typing filters it; the arrow keys move the
// highlight and Enter picks it. Closing puts the picked item's text back in
// the input, so what's typed never disagrees with what's picked.

const ITEM = '.cl-combobox-item:not([aria-disabled="true"])';

interface Parts {
  root: HTMLElement;
  input: HTMLInputElement;
  content: HTMLElement;
  list: HTMLElement;
}

let ids = 0;
const idFor = (el: HTMLElement) => el.id || (el.id = `cl-combobox-${++ids}`);

function partsOf(el: Element | null): Parts | null {
  const root = el?.closest<HTMLElement>(".cl-combobox");
  const input = root?.querySelector<HTMLInputElement>(".cl-combobox-input");
  const content = root?.querySelector<HTMLElement>(".cl-combobox-content");
  const list = content?.querySelector<HTMLElement>(".cl-combobox-list");
  return root && input && content && list ? { root, input, content, list } : null;
}

const isOpen = ({ content }: Parts) => content.matches(":popover-open");
const items = ({ list }: Parts) => [...list.querySelectorAll<HTMLElement>(".cl-combobox-item")];
const visible = (parts: Parts) => items(parts).filter((item) => !item.hidden && item.matches(ITEM));
const label = (item: HTMLElement) => item.textContent?.trim() ?? "";
// Case and accents don't count: "nuxt" finds "Nuxt.js", "creme" finds "Crème".
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Gives each combobox the ARIA roles and ids it needs, so the markup can stay short. */
export function setupComboboxes(root: ParentNode = document) {
  const roots = [...root.querySelectorAll<HTMLElement>(".cl-combobox")];
  if (root instanceof HTMLElement && root.matches(".cl-combobox")) roots.push(root);
  for (const el of roots) {
    const parts = partsOf(el);
    if (!parts) continue;
    const { input, list } = parts;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-haspopup", "listbox");
    input.setAttribute("aria-expanded", String(isOpen(parts)));
    input.setAttribute("aria-controls", idFor(list));
    input.autocomplete = "off";
    list.setAttribute("role", "listbox");
    for (const item of items(parts)) {
      item.setAttribute("role", "option");
      idFor(item);
      if (!item.hasAttribute("aria-selected")) item.setAttribute("aria-selected", "false");
    }
  }
}

function position({ input, content }: Parts) {
  place(content, input, { side: "bottom", align: "start", offset: 6 });
}

function highlight(parts: Parts, item: HTMLElement | null, scroll = true) {
  for (const other of items(parts)) other.toggleAttribute("data-highlighted", other === item);
  if (item) {
    parts.input.setAttribute("aria-activedescendant", item.id);
    if (scroll) item.scrollIntoView({ block: "nearest" });
  } else {
    parts.input.removeAttribute("aria-activedescendant");
  }
}

/** Shows the items whose text has `query` in it, and the empty message if none do. */
function filter(parts: Parts, query: string) {
  const q = fold(query.trim());
  for (const item of items(parts)) item.hidden = !!q && !fold(label(item)).includes(q);
  // A group whose items are all hidden goes too, with its label.
  for (const group of parts.list.querySelectorAll<HTMLElement>('[role="group"]')) {
    group.hidden = !group.querySelector(".cl-combobox-item:not([hidden])");
  }
  for (const separator of parts.list.querySelectorAll<HTMLElement>(".cl-combobox-separator")) {
    separator.hidden = !!q;
  }
  parts.content.toggleAttribute("data-empty", visible(parts).length === 0);
}

function open(parts: Parts) {
  if (isOpen(parts)) return;
  setupComboboxes(parts.root);
  filter(parts, "");
  parts.content.showPopover();
  parts.input.setAttribute("aria-expanded", "true");
  position(parts);
  // Opening again highlights the picked item, like Base UI.
  highlight(
    parts,
    items(parts).find((item) => item.getAttribute("aria-selected") === "true") ?? null,
  );
}

function close(parts: Parts) {
  if (!isOpen(parts)) return;
  parts.content.hidePopover();
  parts.input.setAttribute("aria-expanded", "false");
  highlight(parts, null);
  const picked = items(parts).find((item) => item.getAttribute("aria-selected") === "true");
  parts.input.value = picked ? label(picked) : "";
}

function pick(parts: Parts, item: HTMLElement) {
  for (const other of items(parts)) other.setAttribute("aria-selected", String(other === item));
  const hidden = parts.root.querySelector<HTMLInputElement>('input[type="hidden"]');
  if (hidden) hidden.value = item.dataset.value ?? label(item);
  close(parts);
  parts.input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function onComboboxClick(target: Element) {
  const parts = partsOf(target);
  if (!parts) return;

  const item = target.closest<HTMLElement>(ITEM);
  if (item && parts.list.contains(item)) return pick(parts, item);

  if (target.closest(".cl-combobox-trigger")) {
    parts.input.focus();
    return isOpen(parts) ? close(parts) : open(parts);
  }
  if (target === parts.input && !parts.input.disabled) open(parts);
}

export function onComboboxInput(target: Element) {
  const parts = partsOf(target);
  if (!parts || target !== parts.input) return;
  open(parts);
  filter(parts, parts.input.value);
  highlight(parts, null);
}

export function onComboboxKeyDown(event: KeyboardEvent, target: Element) {
  const parts = partsOf(target);
  if (!parts || target !== parts.input) return;

  const list = visible(parts);
  const current = list.findIndex((item) => item.hasAttribute("data-highlighted"));
  const move = (to: number) => {
    event.preventDefault();
    if (!isOpen(parts)) return open(parts);
    highlight(parts, list[(to + list.length) % list.length] ?? null);
  };

  switch (event.key) {
    case "ArrowDown":
      return move(current + 1);
    case "ArrowUp":
      return move(current < 0 ? -1 : current - 1);
    case "Enter":
      if (isOpen(parts) && current >= 0) {
        // Picks the item instead of sending the form.
        event.preventDefault();
        pick(parts, list[current]!);
      }
      return;
    case "Escape":
      if (isOpen(parts)) {
        event.preventDefault();
        close(parts);
      }
      return;
    case "Tab":
      return close(parts);
  }
}

export function onComboboxPointerMove(target: Element) {
  const item = target.closest<HTMLElement>(ITEM);
  const parts = partsOf(item);
  if (item && parts && !item.hasAttribute("data-highlighted")) highlight(parts, item, false);
}

/** Keeps the focus in the input when the list is clicked. */
export function onComboboxPointerDown(event: PointerEvent, target: Element) {
  if (target.closest(".cl-combobox-content, .cl-combobox-trigger")) event.preventDefault();
}

export function onComboboxFocusOut(event: FocusEvent, target: Element) {
  const parts = partsOf(target);
  if (!parts || target !== parts.input) return;
  const next = event.relatedTarget as Node | null;
  if (next && parts.root.contains(next)) return;
  close(parts);
}

/** Moves open lists with their input when the page scrolls or resizes. */
export function repositionComboboxes() {
  for (const content of document.querySelectorAll<HTMLElement>(
    ".cl-combobox-content:popover-open",
  )) {
    const parts = partsOf(content);
    if (parts) position(parts);
  }
}
