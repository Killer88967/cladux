import {
  ArrowRightIcon,
  BlocksIcon,
  FileCode2Icon,
  PaletteIcon,
  SparklesIcon,
  TerminalIcon,
  WindIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@cladux/ui";
import { ExamplesNav } from "@/components/examples-nav";
import { InstallCommand } from "@/components/install-command";
import { PageHeader } from "@/components/page-header";
import { Showcase } from "@/components/showcase/showcase";
import { getNav } from "@/lib/docs";

const features = [
  {
    icon: WindIcon,
    title: "Tailwind or plain CSS",
    description:
      "The CLI checks your project. With Tailwind you get Tailwind classes; without it, every component comes with its own CSS file.",
  },
  {
    icon: SparklesIcon,
    title: "More than shadcn",
    description:
      "Every shadcn component in the same nova look, plus kanban, tree view, rich text, color picker, tour and more.",
  },
  {
    icon: TerminalIcon,
    title: "Its own CLI",
    description:
      "cladux init and cladux add copy the code into your project. It's yours to change, and it lives next to shadcn without clashing.",
  },
  {
    icon: BlocksIcon,
    title: "Blocks",
    description:
      "Heroes, pricing tables, login screens and dashboards, built from the components and added with one command.",
  },
  {
    icon: PaletteIcon,
    title: "Themes",
    description:
      "Pick a base color, an accent and a radius, then copy the variables. Both styles read the same tokens.",
  },
  {
    icon: FileCode2Icon,
    title: "Accessible by default",
    description:
      "Keyboard support, focus handling and screen reader labels on every component, including the drag and drop.",
  },
];

export default async function Home() {
  const nav = await getNav();
  const newCount = nav
    .find((group) => group.title === "Components")
    ?.items.filter((item) => item.isNew).length;

  return (
    <main>
      <PageHeader
        announcement={{
          href: "/docs/components#new-components",
          label: `${newCount ?? 18} components shadcn doesn't have`,
        }}
        title="The components you need, in the CSS you already use."
        description="Accessible React components in shadcn's look, plus the ones it leaves out. Add them as Tailwind classes or plain CSS files, then make them yours."
      >
        <Button asChild>
          <Link href="/docs">Get Started</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/blocks">
            Browse Blocks <ArrowRightIcon />
          </Link>
        </Button>
      </PageHeader>
      <div className="-mt-4 mb-10 flex justify-center px-4 md:-mt-8">
        <InstallCommand command="npx cladux-ui@latest init" />
      </div>

      <div className="cl-container">
        <ExamplesNav home className="mb-4 md:justify-center" />
        <Showcase />
      </div>

      <section className="cl-container py-16 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Why Cladux</h2>
          <p className="mt-2 text-muted-foreground">
            Copy-paste components you own, with the parts other libraries leave for you to build.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 bg-background p-6">
              <feature.icon className="size-5 text-muted-foreground" />
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center gap-2">
          <Button asChild>
            <Link href="/docs/installation">Install Cladux</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/themes">Make a theme</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
