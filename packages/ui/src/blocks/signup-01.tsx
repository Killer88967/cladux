"use client";

import * as React from "react";

import { Button } from "../button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card/card";
import { Checkbox } from "../checkbox/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import { Label } from "../label/label";
import { PasswordInput, PasswordStrength } from "../password-input/password-input";

export default function Signup01() {
  const [password, setPassword] = React.useState("");
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl leading-7">Create your account</CardTitle>
          <CardDescription>Free for 14 days. No credit card needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="signup-01-first">First name</FieldLabel>
                  <Input id="signup-01-first" autoComplete="given-name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signup-01-last">Last name</FieldLabel>
                  <Input id="signup-01-last" autoComplete="family-name" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="signup-01-email">Work email</FieldLabel>
                <Input id="signup-01-email" type="email" autoComplete="email" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-01-password">Password</FieldLabel>
                <PasswordInput
                  id="signup-01-password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrength value={password} />
              </Field>
              <Label className="items-start gap-2 font-normal">
                <Checkbox required className="mt-0.5" />
                <span>
                  I agree to the{" "}
                  <a href="#" className="underline underline-offset-4">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline underline-offset-4">
                    Privacy Policy
                  </a>
                  .
                </span>
              </Label>
              <Button type="submit">Create account</Button>
              <FieldDescription className="text-center">
                Already have an account? <a href="#">Sign in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
