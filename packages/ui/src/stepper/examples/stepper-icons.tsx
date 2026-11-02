import { CreditCardIcon, PackageIcon, UserIcon } from "lucide-react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@cladux/ui";

const steps = [
  { title: "Details", icon: UserIcon },
  { title: "Shipping", icon: PackageIcon },
  { title: "Payment", icon: CreditCardIcon },
];

export default function StepperIcons() {
  return (
    <Stepper defaultValue={2} className="max-w-md">
      {steps.map(({ title, icon: Icon }, i) => (
        <StepperItem key={title} step={i + 1}>
          <StepperTrigger>
            <StepperIndicator>
              <Icon />
            </StepperIndicator>
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
          {i < steps.length - 1 && <StepperSeparator />}
        </StepperItem>
      ))}
    </Stepper>
  );
}
