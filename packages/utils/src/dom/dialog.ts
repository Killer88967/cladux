/** Opens a <dialog> by id as a modal. */
export function openDialog(id: string) {
  const dialog = document.getElementById(id);
  if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
}

export function onDialogClick(event: MouseEvent, target: Element) {
  const opener = target.closest<HTMLElement>("[data-dialog-open]");
  if (opener) {
    openDialog(opener.dataset.dialogOpen!);
    return;
  }

  const closer = target.closest("[data-dialog-close]");
  if (closer) {
    closer.closest("dialog")?.close();
    return;
  }

  // A click on the backdrop lands on the <dialog> itself, outside its box.
  if (target instanceof HTMLDialogElement && target.matches(".cl-dialog, .cl-sheet")) {
    const r = target.getBoundingClientRect();
    const inside =
      event.clientX >= r.left &&
      event.clientX <= r.right &&
      event.clientY >= r.top &&
      event.clientY <= r.bottom;
    if (!inside) target.close();
  }
}
