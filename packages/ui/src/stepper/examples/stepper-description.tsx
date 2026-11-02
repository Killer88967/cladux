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
  { title: "Upload", description: "Add your files" },
  { title: "Configure", description: "Pick the options" },
  { title: "Deploy", description: "Go live" },
];

export default function StepperDescriptionDemo() {
  return (
    <Stepper defaultValue={2} className="max-w-lg">
      {steps.map((step, i) => (
        <StepperItem key={step.title} step={i + 1} loading={i === 1}>
          <StepperTrigger>
            <StepperIndicator />
            <div>
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
