import type { Metadata } from "next";
import Link from "next/link";
import { DOC_PAGES, docsNav } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "PixelForge docs: environment variables, architecture, image enhancement, background removal, GFPGAN, HTTP API, and troubleshooting.",
  alternates: { canonical: "/docs" },
};

export default function DocsHomePage() {
  const nav = docsNav();
  return (
    <div className="px-24 py-48 md:px-48">
      <p className="text-[12px] uppercase tracking-[0.05em] text-accent">PixelForge documentation</p>
      <h1 className="font-display mt-12 max-w-[720px] text-[clamp(2.25rem,4vw,2.75rem)] leading-[1.15] tracking-[-0.02em]">
        Reference for the restoration platform, not a marketing pamphlet.
      </h1>
      <p className="prose-measure mt-16 text-[1.125rem] leading-[1.6] text-text-secondary">
        Search the header, browse the sidebar, or jump into a section. Pages describe the software that actually ships — including features that are unavailable on purpose.
      </p>
      <div className="mt-48 grid gap-16 md:grid-cols-2">
        {nav.map((group) => (
          <section key={group.section} className="rounded-[12px] border border-border bg-surface p-24 shadow-soft">
            <h2 className="text-[12px] uppercase tracking-[0.05em] text-text-subtle">{group.section}</h2>
            <ul className="mt-16 space-y-12">
              {group.pages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/docs/${page.slug}`} className="text-[16px] text-text hover:text-accent">
                    {page.title}
                  </Link>
                  <p className="mt-4 text-[14px] text-text-secondary">{page.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-32 text-[14px] text-text-subtle">{DOC_PAGES.length} articles.</p>
    </div>
  );
}
