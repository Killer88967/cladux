"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  Input,
  PasswordInput,
  PasswordStrength,
  Spinner,
} from "@cladux/ui";

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function AuthenticationExample() {
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="grid min-h-[640px] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary-foreground text-sm text-primary">
            A
          </span>
          Acme Inc.
        </div>
        <blockquote className="relative grid gap-3">
          <p className="text-lg leading-relaxed">
            &ldquo;We rebuilt our whole admin in a week. Half the components we needed weren&apos;t
            in any other library.&rdquo;
          </p>
          <footer className="text-sm opacity-80">Sofia Davis, Head of Product</footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              toast.success("Account created");
            }, 900);
          }}
        >
          <FieldGroup>
            <div className="grid gap-1 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Create an account</h2>
              <p className="text-sm text-muted-foreground">Enter your email to get started.</p>
            </div>
            <Field>
              <FieldLabel htmlFor="auth-email">Email</FieldLabel>
              <Input id="auth-email" type="email" placeholder="you@example.com" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="auth-password">Password</FieldLabel>
              <PasswordInput
                id="auth-password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && <PasswordStrength value={password} showRules={false} />}
            </Field>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              Create account
            </Button>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Button type="button" variant="outline">
              <GitHubIcon className="size-4" /> GitHub
            </Button>
            <FieldDescription className="text-center">
              By continuing, you agree to our <Link href="#">Terms of Service</Link> and{" "}
              <Link href="#">Privacy Policy</Link>.
            </FieldDescription>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
