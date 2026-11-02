import { Avatar, AvatarFallback, Marquee } from "@cladux/ui";

const reviews = [
  { name: "Ada", text: "Installed in a minute and it just matched our theme." },
  { name: "Linus", text: "The CSS style saved us from adding Tailwind to a legacy app." },
  { name: "Grace", text: "Tree View and Stepper were exactly what our dashboard needed." },
  { name: "Alan", text: "Keyboard support everywhere. Our a11y audit passed first try." },
];

export default function MarqueeCards() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      {(["left", "right"] as const).map((direction) => (
        <Marquee key={direction} direction={direction} speed={30}>
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="flex w-64 flex-col gap-2 rounded-xl border bg-card p-3 text-sm"
            >
              <figcaption className="flex items-center gap-2 font-medium">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">{review.name[0]}</AvatarFallback>
                </Avatar>
                {review.name}
              </figcaption>
              <blockquote className="text-muted-foreground">{review.text}</blockquote>
            </figure>
          ))}
        </Marquee>
      ))}
    </div>
  );
}
