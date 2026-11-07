import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { codeToHtml } from "shiki";
import { Button } from "@cladux/ui";
import { blocks } from "@cladux/ui/blocks/_blocks";
import { BlockViewer } from "@/components/block-viewer";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Blocks",
  description: "Page sections built from Cladux components, ready to add with the CLI.",
};

const REPO_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "../..");

/** The block's source as it lands in a project: imports point at your components. */
async function source(name: string) {
  const raw = await readFile(path.join(REPO_ROOT, "packages/ui/src/blocks", `${name}.tsx`), "utf8");
  return raw.replace(/from "\.\.\/[\w-]+\/([\w-]+)"/g, 'from "@/components/cl/$1"').trim();
}

const categories = ["Marketing", "Authentication", "Application", "E-commerce"] as const;

export default async function BlocksPage() {
  const withCode = await Promise.all(
    blocks.map(async (block) => {
      const code = await source(block.name);
      const html = await codeToHtml(code, {
        lang: "tsx",
        themes: { light: "github-light", dark: "github-dark" },
      });
      return { ...block, code, html };
    }),
  );

  return (
    <main>
      <PageHeader
        title="Building blocks for the web"
        description="Heroes, pricing tables, login screens, app shells and shop pages, built from Cladux components. Add one with a single command, in Tailwind or plain CSS."
      >
        <Button asChild>
          <a href="#navbar-01">Browse blocks</a>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/docs/installation">Set up the CLI</Link>
        </Button>
      </PageHeader>
      <div className="cl-container pb-20">
        <nav
          aria-label="Block categories"
          className="sticky top-14 z-10 -mx-4 mb-8 flex gap-1 overflow-x-auto border-b bg-background/90 px-4 py-2 backdrop-blur"
        >
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase()}`}
              className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {category}
            </a>
          ))}
        </nav>
        {categories.map((category) => (
          <div key={category} className="mb-16">
            <h2
              id={category.toLowerCase()}
              className="mb-6 scroll-mt-28 text-2xl font-semibold tracking-tight"
            >
              {category}
            </h2>
            <div className="flex flex-col gap-14">
              {withCode
                .filter((block) => block.category === category)
                .map((block) => (
                  <BlockViewer
                    key={block.name}
                    name={block.name}
                    title={block.title}
                    description={block.description}
                    code={block.code}
                    html={block.html}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
