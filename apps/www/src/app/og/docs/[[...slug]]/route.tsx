import { getDoc, getDocSlugs } from "@/lib/docs";
import { ogImage } from "@/lib/og";

// Each docs page's Open Graph image, at /og/docs/<slug>: its title and description.
// (An opengraph-image file can't sit inside the docs' optional catch-all route.)

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getDocSlugs()).map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/og/docs/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);
  return ogImage({
    title: doc?.metadata.title ?? "Docs",
    description: doc?.metadata.description,
    label: slug[0] === "components" ? "Components" : "Docs",
  });
}
