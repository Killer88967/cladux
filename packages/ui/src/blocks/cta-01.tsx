import { ArrowRightIcon } from "lucide-react";

import { Button } from "../button/button";

export default function Cta01() {
  return (
    <section className="px-4 py-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to build something great?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance opacity-80">
            Join 12,000 teams shipping faster with Acme. Set up takes two minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary">
              Start for free <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
