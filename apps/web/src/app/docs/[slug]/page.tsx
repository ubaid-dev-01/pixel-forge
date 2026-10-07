import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs/DocsArticle";
import { DOC_PAGES, docBySlug } from "@/lib/docs";

export function generateStaticParams() {
  return DOC_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = docBySlug(slug);
  return {
    title: page?.title ?? "Docs",
    description: page?.summary,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = docBySlug(slug);
  if (!page) notFound();
  return <DocsArticle page={page} />;
}
