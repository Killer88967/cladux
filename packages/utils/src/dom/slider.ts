// Two things a native range input doesn't do the way the React Slider does:
//
// - Chrome and Safari can't fill the track up to the thumb, so this keeps
//   --cl-slider-fill on each .cl-slider at its value, as a percentage, and the
//   CSS draws the filled part with it. Firefox doesn't need it.
// - On a touch screen, Safari only drags from the thumb, which is 12px. Here a
//   finger anywhere on the slider moves the thumb there and drags it, like
//   the React one. A mouse keeps the browser's own dragging.

const THUMB = 12;

const bounds = (input: HTMLInputElement) => {
  const min = input.min === "" ? 0 : Number(input.min);
  const max = input.max === "" ? 100 : Number(input.max);
  return { min, max };
};

function fill(input: HTMLInputElement) {
  const { min, max } = bounds(input);
  const percent = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--cl-slider-fill", `${percent}%`);
}

export function onSliderInput(target: Element) {
  if (target instanceof HTMLInputElement && target.matches(".cl-slider")) fill(target);
}

/** Fills the sliders under `root`, and `root` itself if it's one. */
export function setupSliders(root: ParentNode = document) {
  if (root instanceof HTMLInputElement && root.matches(".cl-slider")) fill(root);
  for (const input of root.querySelectorAll<HTMLInputElement>("input.cl-slider")) fill(input);
}

// A form reset changes the values without an input event, and only after the event.
export function onFormReset(target: Element) {
  if (target instanceof HTMLFormElement) setTimeout(() => setupSliders(target));
}

/** Moves the thumb to where the finger is, as the browser does for a mouse. */
function moveTo(input: HTMLInputElement, x: number) {
  const rect = input.getBoundingClientRect();
  let ratio = Math.min(1, Math.max(0, (x - rect.left - THUMB / 2) / (rect.width - THUMB)));
  if (getComputedStyle(input).direction === "rtl") ratio = 1 - ratio;

  const { min, max } = bounds(input);
  const step = input.step === "any" ? 0 : Number(input.step || 1);
  let value = min + ratio * (max - min);
  if (step > 0) value = min + Math.round((value - min) / step) * step;

  const before = input.value;
  // The browser keeps it inside min and max, and on the step.
  input.value = String(value);
  if (input.value !== before) input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function onSliderPointerDown(event: PointerEvent, target: Element) {
  if (event.pointerType === "mouse") return;
  if (!(target instanceof HTMLInputElement) || !target.matches(".cl-slider") || target.disabled) {
    return;
  }

  const input = target;
  const start = input.value;
  input.focus({ preventScroll: true });
  try {
    // Keeps the moves coming to the slider when the finger leaves it.
    input.setPointerCapture(event.pointerId);
  } catch {
    // Not a real pointer, such as one made up by a test.
  }
  moveTo(input, event.clientX);

  const move = (e: PointerEvent) => {
    if (e.pointerId === event.pointerId) moveTo(input, e.clientX);
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== event.pointerId) return;
    input.removeEventListener("pointermove", move);
    input.removeEventListener("pointerup", end);
    input.removeEventListener("pointercancel", end);
    if (input.value !== start) input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  input.addEventListener("pointermove", move);
  input.addEventListener("pointerup", end);
  input.addEventListener("pointercancel", end);
}
