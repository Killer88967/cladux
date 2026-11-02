"use client";

import * as React from "react";
import {
  Button,
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@cladux/ui";

const steps = ["Account", "Profile", "Billing", "Review"];

export default function StepperDemo() {
  const [step, setStep] = React.useState(2);

  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <Stepper value={step} onValueChange={setStep}>
        {steps.map((title, i) => (
          <StepperItem key={title} step={i + 1}>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>{title}</StepperTitle>
            </StepperTrigger>
            {i < steps.length - 1 && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <Button disabled={step > steps.length} onClick={() => setStep(step + 1)}>
          {step >= steps.length ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
