import { onDialogClick, openDialog } from "./dialog";
import {
  hideAllTooltips,
  onFloatingBeforeToggle,
  onFloatingToggle,
  onMenuClick,
  onMenuKeyDown,
  onMenuPointerLeave,
  onMenuPointerMove,
  onTooltipEnter,
  onTooltipLeave,
  repositionOpen,
} from "./floating";
import { onTabClick, onTabKeyDown, setupTabs } from "./tabs";
import { onToastClick, toast } from "./toast";

export { openDialog } from "./dialog";
export { place, type Align, type PlaceOptions, type Side } from "./position";
export { toast, type ToastOptions, type ToastType } from "./toast";

let started = false;

const asElement = (target: EventTarget | null) => (target instanceof Element ? target : null);

/**
 * Turns on the behavior for the CSS-only components: dialogs, popovers,
 * dropdown menus, tooltips, tabs and toasts. Listeners are delegated to the
 * document, so markup added later works too. Safe to call more than once.
 */
export function start() {
  if (started || typeof document === "undefined") return;
  started = true;

  document.addEventListener("click", (event) => {
    const target = asElement(event.target);
    if (!target) return;
    onDialogClick(event, target);
    onMenuClick(target);
    onTabClick(target);
    onToastClick(target);
  });

  document.addEventListener("keydown", (event) => {
    const target = asElement(event.target);
    if (event.key === "Escape") hideAllTooltips();
    if (!target) return;
    onMenuKeyDown(event, target);
    onTabKeyDown(event, target);
  });

  // Popover toggle events don't bubble, so listen in the capture phase.
  document.addEventListener("beforetoggle", onFloatingBeforeToggle, true);
  document.addEventListener("toggle", onFloatingToggle, true);
  document.addEventListener("pointerleave", onMenuPointerLeave as EventListener, true);

  document.addEventListener("pointermove", (event) => {
    const target = asElement(event.target);
    if (target) onMenuPointerMove(target);
  });
  document.addEventListener("pointerover", (event) => {
    const target = asElement(event.target);
    if (target) onTooltipEnter(event, target);
  });
  document.addEventListener("pointerout", (event) => {
    const target = asElement(event.target);
    if (target) onTooltipLeave(event, target);
  });
  document.addEventListener("focusin", (event) => {
    const target = asElement(event.target);
    if (target) onTooltipEnter(event, target);
  });
  document.addEventListener("focusout", (event) => {
    const target = asElement(event.target);
    if (target) onTooltipLeave(event, target);
  });

  window.addEventListener("scroll", repositionOpen, { capture: true, passive: true });
  window.addEventListener("resize", repositionOpen, { passive: true });

  const ready = () => setupTabs();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
}

export const cl = { start, toast, openDialog };
