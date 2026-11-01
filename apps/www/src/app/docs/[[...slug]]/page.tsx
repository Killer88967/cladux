import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { notFound } from "next/navigation";
import type { ComponentProps, ComponentType } from "react";
import { Button } from "@cladux/ui";
import { CliCommand } from "@/components/cli-command";
import { DocH2, textOf } from "@/components/doc-heading";
import { getDoc, getDocSlugs, getInstall, getPager, type InstallInfo } from "@/lib/docs";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getDocSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);
  return doc ? { title: doc.metadata.title, description: doc.metadata.description } : {};
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
      <Doc components={install ? withInstall(install) : undefined} />
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

/** Component pages get an Installation section, placed before "Usage". */
function withInstall(install: InstallInfo): MDXComponents {
  return {
    h2: (props: ComponentProps<"h2">) =>
      textOf(props.children) === install.before ? (
        <>
          <DocH2>Installation</DocH2>
          <CliCommand args={`add ${install.items.join(" ")}`} />
          {install.packages && (
            <>
              <p className="my-4 leading-7">The examples on this page also use:</p>
              <CliCommand packages={install.packages} />
            </>
          )}
          <DocH2 {...props} />
        </>
      ) : (
        <DocH2 {...props} />
      ),
  };
}
