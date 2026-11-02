import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blocks } from "@cladux/ui/blocks/_blocks";
import { blockComponents } from "@/lib/blocks.generated";

// A block on its own page, for the previews on /blocks (and for opening full screen).

export function generateStaticParams() {
  return blocks.map((block) => ({ name: block.name }));
}

export async function generateMetadata({ params }: PageProps<"/view/[name]">): Promise<Metadata> {
  const { name } = await params;
  const block = blocks.find((b) => b.name === name);
  return { title: block ? `${block.title} block` : "Block" };
}

export default async function ViewBlock({ params }: PageProps<"/view/[name]">) {
  const { name } = await params;
  const Block = blockComponents[name];
  if (!Block) notFound();
  // The wrapper is what the preview on /blocks measures to size its iframe.
  return (
    <div id="block-root">
      <Block />
    </div>
  );
}
