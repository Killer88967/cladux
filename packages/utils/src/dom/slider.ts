// Chrome and Safari can't fill a range input's track up to the thumb, so this
// keeps --cl-slider-fill on each .cl-slider at its value, as a percentage.
// The CSS draws the filled part with it. Firefox doesn't need it.

function fill(input: HTMLInputElement) {
  const min = input.min === "" ? 0 : Number(input.min);
  const max = input.max === "" ? 100 : Number(input.max);
  const percent = max > min ? ((Number(input.value) - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--cl-slider-fill", `${percent}%`);
}

export function onSliderInput(target: Element) {
  if (target instanceof HTMLInputElement && target.matches(".cl-slider")) fill(target);
}

/** Fills the sliders already on the page, or under `root`. */
export function setupSliders(root: ParentNode = document) {
  for (const input of root.querySelectorAll<HTMLInputElement>("input.cl-slider")) fill(input);
}

// A form reset changes the values without an input event, and only after the event.
export function onFormReset(target: Element) {
  if (target instanceof HTMLFormElement) setTimeout(() => setupSliders(target));
}
