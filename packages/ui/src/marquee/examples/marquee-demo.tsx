import { Marquee } from "@cladux/ui";

const logos = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka"];

export default function MarqueeDemo() {
  return (
    <Marquee className="w-full max-w-xl" gap={48}>
      {logos.map((name) => (
        <span key={name} className="text-lg font-semibold tracking-tight text-muted-foreground">
          {name}
        </span>
      ))}
    </Marquee>
  );
}
