import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextShimmer() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium">
        <AnimatedText effect="shimmer">Thinking about your question…</AnimatedText>
      </p>
      <p className="text-4xl font-bold tracking-tight">
        <AnimatedText effect="gradient" className="from-pink-500 via-violet-500 to-pink-500">
          Make it yours
        </AnimatedText>
      </p>
    </div>
  );
}
