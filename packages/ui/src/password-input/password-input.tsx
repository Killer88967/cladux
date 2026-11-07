"use client";

import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

function PasswordInput({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      data-slot="password-input"
      data-disabled={disabled || undefined}
      className={cn(
        "relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50",
        className,
      )}
    >
      <input
        type={visible ? "text" : "password"}
        data-slot="password-input-input"
        autoComplete="current-password"
        spellCheck={false}
        disabled={disabled}
        className="h-full w-full min-w-0 bg-transparent py-1 ps-2.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        {...props}
      />
      <button
        type="button"
        data-slot="password-input-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className="me-1 flex size-6 shrink-0 items-center justify-center rounded-[min(var(--radius-md),10px)] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:size-3.5"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

const defaultPasswordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;

/** A 0-4 score: how many rules pass, scaled to four steps. */
function getPasswordStrength(password: string, rules: PasswordRule[] = defaultPasswordRules) {
  if (!password) return 0;
  const passed = rules.filter((rule) => rule.test(password)).length;
  return Math.round((passed / rules.length) * 4);
}

function PasswordStrength({
  className,
  value,
  rules = defaultPasswordRules,
  showRules = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** The password to measure. */
  value: string;
  rules?: PasswordRule[];
  showRules?: boolean;
}) {
  const score = getPasswordStrength(value, rules);

  return (
    <div
      data-slot="password-strength"
      data-strength={score}
      className={cn("group/password-strength flex flex-col gap-2 text-xs", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              data-active={score >= step || undefined}
              className="h-1 flex-1 rounded-full bg-muted transition-colors group-data-[strength=1]/password-strength:data-active:bg-destructive group-data-[strength=2]/password-strength:data-active:bg-amber-500 group-data-[strength=3]/password-strength:data-active:bg-emerald-500 group-data-[strength=4]/password-strength:data-active:bg-emerald-600"
            />
          ))}
        </div>
        <span
          data-slot="password-strength-label"
          aria-live="polite"
          className="w-14 shrink-0 text-end text-muted-foreground"
        >
          {value ? strengthLabels[score] : ""}
        </span>
      </div>
      {showRules && (
        <ul data-slot="password-strength-rules" className="grid gap-1">
          {rules.map((rule) => {
            const met = rule.test(value);
            return (
              <li
                key={rule.label}
                data-met={met || undefined}
                className="flex items-center gap-1.5 text-muted-foreground data-met:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0"
              >
                {met ? <CheckIcon className="text-emerald-600 dark:text-emerald-500" /> : <XIcon />}
                <span>{rule.label}</span>
                <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { defaultPasswordRules, getPasswordStrength, PasswordInput, PasswordStrength };
export type { PasswordRule };
