import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@cladux/ui";

const steps = [
  { title: "Order placed", description: "We've received your order." },
  { title: "Packed", description: "Your items are boxed and labeled." },
  { title: "Shipped", description: "On its way with the courier." },
  { title: "Delivered", description: "Expected Thursday." },
];

export default function StepperVertical() {
  return (
    <Stepper defaultValue={3} orientation="vertical" interactive={false} className="max-w-xs">
      {steps.map((step, i) => (
        <StepperItem key={step.title} step={i + 1}>
          <StepperTrigger>
            <StepperIndicator />
            <div className="flex flex-col gap-0.5 pt-1.5">
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </div>
          </StepperTrigger>
          {i < steps.length - 1 && <StepperSeparator />}
        </StepperItem>
      ))}
    </Stepper>
  );
}
