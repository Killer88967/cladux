import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Marquee } from "../marquee/marquee";

const quotes = [
  {
    name: "Sofia Davis",
    role: "Head of Product, Lumen",
    text: "We replaced three tools with Acme in a month. Nobody misses the old setup.",
  },
  {
    name: "Jackson Lee",
    role: "CTO, Northwind",
    text: "The API is the cleanest we've integrated. It took an afternoon.",
  },
  {
    name: "Isabella Nguyen",
    role: "Designer, Pixel & Co",
    text: "Finally a tool our designers and engineers both like opening.",
  },
  {
    name: "William Kim",
    role: "Founder, Brightside",
    text: "Support answered in four minutes. On a Sunday.",
  },
  {
    name: "Olivia Martin",
    role: "Engineering Manager, Vela",
    text: "Planning meetings went from an hour to fifteen minutes.",
  },
  {
    name: "Ethan Brooks",
    role: "Ops Lead, Harbor",
    text: "The reports alone are worth the price. Our board loves them.",
  },
];

function Quote({ name, role, text }: (typeof quotes)[number]) {
  return (
    <figure className="flex w-72 flex-col gap-3 rounded-xl border bg-card p-4 text-sm">
      <blockquote className="text-muted-foreground">&ldquo;{text}&rdquo;</blockquote>
      <figcaption className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span>
          <span className="block font-medium">{name}</span>
          <span className="block text-xs text-muted-foreground">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials01() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by teams everywhere
        </h2>
        <p className="mt-3 text-muted-foreground">Over 12,000 teams build with Acme every day.</p>
      </div>
      <div className="mt-12 grid gap-4">
        <Marquee speed={30}>
          {quotes.slice(0, 3).map((quote) => (
            <Quote key={quote.name} {...quote} />
          ))}
        </Marquee>
        <Marquee speed={30} direction="right">
          {quotes.slice(3).map((quote) => (
            <Quote key={quote.name} {...quote} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
