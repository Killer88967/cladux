import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextSplit() {
  return (
    <div className="grid w-full max-w-xl gap-8">
      <p className="text-2xl font-semibold tracking-tight">
        <AnimatedText effect="blur-in" by="char">
          One character at a time
        </AnimatedText>
      </p>
      <p className="text-2xl font-semibold tracking-tight">
        <AnimatedText effect="flip" by="char" delay={300}>
          Flipped up from flat
        </AnimatedText>
      </p>
      <p className="text-2xl font-semibold tracking-tight">
        <AnimatedText effect="bounce" delay={600}>
          Dropped in with a bounce
        </AnimatedText>
      </p>
      <p className="text-muted-foreground">
        <AnimatedText effect="fade-up" by="line">
          By line, the words that share a line come in together, so a long paragraph reads like it's
          being laid out in front of you rather than spelled out word by word.
        </AnimatedText>
      </p>
    </div>
  );
}
