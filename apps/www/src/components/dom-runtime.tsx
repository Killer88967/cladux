"use client";

import * as React from "react";
import { cl, start } from "@cladux/utils/dom";

declare global {
  interface Window {
    cl: typeof cl;
  }
}

/** Turns on the runtime for the CSS-only demos (dialogs, menus, tabs, toasts). */
export function DomRuntime() {
  React.useEffect(() => {
    window.cl = cl;
    start();
  }, []);

  return null;
}
