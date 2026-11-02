import * as React from "react";

/**
 * State that is controlled when `value` is passed and uncontrolled otherwise,
 * the way Radix components behave. `onChange` fires either way.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  // Keep the latest value and callback without re-creating the setter.
  const ref = React.useRef({ current, onChange });
  ref.current = { current, onChange };

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(ref.current.current) : next;
      if (Object.is(resolved, ref.current.current)) return;
      ref.current.current = resolved;
      if (!controlled) setInner(resolved);
      ref.current.onChange?.(resolved);
    },
    [controlled],
  );

  return [current, set] as const;
}
