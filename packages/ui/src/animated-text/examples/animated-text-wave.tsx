import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextWave() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-3xl font-semibold tracking-tight">
        <AnimatedText effect="wave">Hello there!</AnimatedText>
      </p>
      <p className="font-mono text-3xl font-bold tracking-tight uppercase">
        <AnimatedText effect="glitch">System failure</AnimatedText>
      </p>
    </div>
  );
}
