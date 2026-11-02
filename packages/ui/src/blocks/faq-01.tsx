import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion/accordion";
import { Button } from "../button/button";

const faqs = [
  [
    "Is there a free plan?",
    "Yes. The Hobby plan is free forever for one project and up to five people.",
  ],
  [
    "Can I change plans later?",
    "Any time. Upgrades apply right away; downgrades apply at the end of your billing period.",
  ],
  [
    "Do you offer discounts?",
    "Nonprofits, students and open source projects get 50% off. Email us with a link and we'll set it up.",
  ],
  [
    "Where is my data stored?",
    "In the EU or the US, your choice. Both regions are encrypted at rest and backed up daily.",
  ],
  ["How do I cancel?", "From Settings → Billing. There's no call to book and no form to fill in."],
];

export default function Faq01() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.5fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Questions?</h2>
          <p className="mt-3 text-muted-foreground">
            Can&apos;t find the answer here? Our team answers within a few hours.
          </p>
          <Button variant="outline" className="mt-6">
            Contact support
          </Button>
        </div>
        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map(([question, answer], i) => (
            <AccordionItem key={question} value={`item-${i}`}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
