import * as React from "react";

import { Button } from "../button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "../field/field";
import { Input } from "../input/input";
import { PasswordInput } from "../password-input/password-input";

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.73Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3a7.2 7.2 0 0 1-10.73-3.78H1.32v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.33 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.32a12 12 0 0 0 0 10.84l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.32 6.58l4.01 3.1A7.15 7.15 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export default function Login01() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl leading-7">Welcome back</CardTitle>
          <CardDescription>Sign in with your GitHub or Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid gap-2">
                <Button variant="outline" type="button">
                  <GitHubIcon className="size-4" /> Continue with GitHub
                </Button>
                <Button variant="outline" type="button">
                  <GoogleIcon className="size-4" /> Continue with Google
                </Button>
              </div>
              <FieldSeparator>Or with email</FieldSeparator>
              <Field>
                <FieldLabel htmlFor="login-01-email">Email</FieldLabel>
                <Input id="login-01-email" type="email" placeholder="you@example.com" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="login-01-password">Password</FieldLabel>
                  <a href="#" className="ms-auto text-sm underline-offset-4 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <PasswordInput id="login-01-password" required />
              </Field>
              <Button type="submit">Sign in</Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
