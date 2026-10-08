import type { Metadata } from "next";
import Link from "next/link";
import { TOOL_CATALOG } from "@pixelforge/shared";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Image & video tools",
  description:
    "Browse PixelForge tools: image upscaler, photo restoration, background remover, face restoration, cleanup, and video enhancement.",
  alternates: { canonical: "/tools" },
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixelforge.app";

export default function ToolsPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <Navbar />
      <main className="pf-atmosphere relative min-h-[70vh]">
        <div className="relative mx-auto max-w-[960px] px-24 py-72 sm:px-40">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-brand-navy">
            Image and video tools
          </h1>
          <p className="prose-measure mt-14 text-[1.05rem] text-text-secondary">
            Sign in to run a job. Frame interpolation stays listed as coming soon until a licensed model is loaded.
          </p>
          <ul className="mt-48 divide-y divide-border border-y border-border">
            {TOOL_CATALOG.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={tool.href}
                  className="group flex flex-col gap-6 py-22 transition-colors duration-200 sm:flex-row sm:items-baseline sm:justify-between sm:gap-32"
                >
                  <span className="font-display text-[1.25rem] tracking-[-0.02em] text-brand-navy group-hover:text-accent">
                    {tool.label}
                    {tool.comingSoon ? (
                      <span className="ml-12 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-text-subtle">
                        Soon
                      </span>
                    ) : null}
                  </span>
                  <span className="max-w-[48ch] text-[0.95rem] text-text-muted sm:text-right">
                    {tool.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
