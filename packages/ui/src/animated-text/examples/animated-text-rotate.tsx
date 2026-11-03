import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextRotate() {
  return (
    <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
      Build{" "}
      <AnimatedText
        effect="rotate"
        words={["dashboards", "landing pages", "admin panels", "apps"]}
        className="text-primary underline decoration-muted-foreground/40 underline-offset-4"
      />{" "}
      faster
    </h2>
  );
}
