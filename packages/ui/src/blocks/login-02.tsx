import * as React from "react";

import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "../field/field";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { PasswordInput } from "../password-input/password-input";

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function Login02() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            A
          </span>
          Acme Inc.
        </a>
        <div className="flex flex-1 items-center justify-center py-10">
          <form className="w-full max-w-xs">
            <FieldGroup>
              <div className="grid gap-1 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
                <p className="text-sm text-muted-foreground">Enter your email below to sign in</p>
              </div>
              <Field>
                <FieldLabel htmlFor="login-02-email">Email</FieldLabel>
                <Input id="login-02-email" type="email" placeholder="you@example.com" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="login-02-password">Password</FieldLabel>
                <PasswordInput id="login-02-password" required />
              </Field>
              <Label className="gap-2 font-normal">
                <Checkbox defaultChecked /> Keep me signed in
              </Label>
              <Button type="submit">Sign in</Button>
              <FieldSeparator>Or continue with</FieldSeparator>
              <Button variant="outline" type="button">
                <GitHubIcon className="size-4" /> GitHub
              </Button>
              <FieldDescription className="text-center">
                New here? <a href="#">Create an account</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <blockquote className="absolute inset-x-10 bottom-10 grid gap-3 text-primary-foreground">
          <p className="text-xl leading-relaxed font-medium">
            &ldquo;Acme saved our team hours every week. It&apos;s the first tool everyone opens in
            the morning.&rdquo;
          </p>
          <footer className="text-sm opacity-80">Jackson Lee, CTO at Northwind</footer>
        </blockquote>
      </div>
    </div>
  );
}
