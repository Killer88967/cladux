import { AnimatedText } from "@cladux/ui";

export default function AnimatedTextTypewriter() {
  return (
    <p className="font-mono text-lg">
      <span className="text-muted-foreground">$ </span>
      <AnimatedText
        effect="typewriter"
        phrases={[
          "npx cladux-ui@latest init",
          "npx cladux-ui@latest add button",
          "npx cladux-ui@latest docs countdown",
        ]}
      />
    </p>
  );
}
