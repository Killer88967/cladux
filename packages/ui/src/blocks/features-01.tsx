import { BoltIcon, GlobeIcon, LockIcon, PlugIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

const features = [
  {
    icon: BoltIcon,
    title: "Fast by default",
    description: "Pages load from the edge in under 100 ms, anywhere in the world.",
  },
  {
    icon: LockIcon,
    title: "Secure",
    description: "SSO, audit logs and encryption at rest on every plan.",
  },
  {
    icon: UsersIcon,
    title: "Built for teams",
    description: "Roles, shared workspaces and comments where the work happens.",
  },
  {
    icon: PlugIcon,
    title: "Integrations",
    description: "Connect GitHub, Slack, Linear and 40 more tools in a click.",
  },
  {
    icon: GlobeIcon,
    title: "Global",
    description: "Every screen ships in 12 languages, right to left included.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Compliant",
    description: "SOC 2 Type II and GDPR, with a data processing agreement.",
  },
];

export default function Features01() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-muted-foreground">
            The basics done properly, so you can focus on what makes your product different.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="size-4" />
              </span>
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
