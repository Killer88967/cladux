import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextHighlight() {
  return (
    <div className="flex max-w-lg flex-col items-center gap-8 text-center">
      <p className="text-lg text-balance">
        Cladux gives you every component shadcn/ui has,{" "}
        <AnimatedText effect="highlight" className="from-yellow-300/60 to-yellow-300/60">
          plus the ones you'd otherwise build yourself
        </AnimatedText>
        .
      </p>
      <p className="font-mono text-2xl font-semibold tracking-tight">
        <AnimatedText effect="scramble">ACCESS GRANTED</AnimatedText>
      </p>
    </div>
  );
}
