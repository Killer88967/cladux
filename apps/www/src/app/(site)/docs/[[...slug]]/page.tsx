import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { notFound } from "next/navigation";
import type { ComponentProps, ComponentType } from "react";
import { Button } from "@cladux/ui";
import { CliCommand } from "@/components/cli-command";
import { DocH2, DocH3, headingId, textOf } from "@/components/doc-heading";
import { getDoc } from "@/lib/doc-content";
import { getDocSlugs, getInstall, getPager, type InstallInfo } from "@/lib/docs";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getDocSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
    // The same page as Markdown, written by scripts/llms.ts.
    alternates: { types: { "text/markdown": `/docs/${slug.join("/")}.md`.replace("/.md", ".md") } },
    // The page's own preview image, from app/og/docs.
    openGraph: {
      siteName: "Cladux",
      images: [{ url: `/og/docs/${slug.join("/")}`.replace(/\/$/, ""), width: 1200, height: 630 }],
    },
  };
}

export default async function DocPage({ params }: PageProps<"/docs/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);
  if (!doc) notFound();

  const { Content, metadata } = doc;
  const install = await getInstall(slug);
  const Doc = Content as ComponentType<{ components?: MDXComponents }>;
  const { prev, next } = await getPager(`/docs/${slug.join("/")}`.replace(/\/$/, ""));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{metadata.title}</h1>
      {metadata.description && (
        <p className="mt-2 text-lg text-muted-foreground">{metadata.description}</p>
      )}
      <Doc components={docComponents(install)} />
      <div className="mt-16 flex items-center justify-between border-t pt-6">
        {prev ? (
          <Button variant="outline" asChild>
            <Link href={prev.href}>
              <ArrowLeftIcon data-icon="inline-start" />
              {prev.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button variant="outline" asChild>
            <Link href={next.href}>
              {next.title}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Headings get unique ids per page ("props", "props-2"...), so anchors and the
 * table of contents still work when two sections share a subheading. Component
 * pages also get an Installation section, placed before "Usage".
 */
function docComponents(install: InstallInfo | null): MDXComponents {
  const used = new Map<string, number>();
  const unique = (base: string) => {
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const h2 = (props: ComponentProps<"h2">) => (
    <DocH2 {...props} id={unique(headingId(props.children))} />
  );
  return {
    h3: (props: ComponentProps<"h3">) => (
      <DocH3 {...props} id={unique(headingId(props.children))} />
    ),
    h2: (props: ComponentProps<"h2">) =>
      install && textOf(props.children) === install.before ? (
        <>
          <DocH2 id={unique("installation")}>Installation</DocH2>
          <CliCommand args={`add ${install.items.join(" ")}`} />
          {install.packages && (
            <>
              <p className="my-4 leading-7">The examples on this page also use:</p>
              <CliCommand packages={install.packages} />
            </>
          )}
          {h2(props)}
        </>
      ) : (
        h2(props)
      ),
  };
}
