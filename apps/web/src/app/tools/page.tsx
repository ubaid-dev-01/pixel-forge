import type { Metadata } from "next";
import Link from "next/link";
import { TOOL_CATALOG } from "@pixelforge/shared";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IsoIcon, toolIcon } from "@/components/brand/IsoIcons";

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
      <main className="mx-auto max-w-[1100px] px-24 py-64">
        <h1 className="font-display text-[2.25rem] leading-[1.15] tracking-[-0.02em]">
          Image and video tools
        </h1>
        <p className="prose-measure mt-12 text-[1rem] leading-[1.6] text-text-secondary">
          Sign in to run a job. Frame interpolation stays listed as coming soon until a licensed model is loaded.
          Related:{" "}
          <Link href="/docs/image-enhancement" className="text-accent hover:text-accent-hover">
            enhancement docs
          </Link>
          ,{" "}
          <Link href="/docs/background" className="text-accent hover:text-accent-hover">
            background removal
          </Link>
          , and{" "}
          <Link href="/docs/video" className="text-accent hover:text-accent-hover">
            video tools
          </Link>
          .
        </p>
        <div className="mt-32 grid gap-16 md:grid-cols-2">
          {TOOL_CATALOG.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="rounded-[12px] border border-border bg-surface p-24 shadow-soft transition-colors duration-[150ms] hover:border-border-strong"
            >
              <IsoIcon name={toolIcon(tool.slug)} className="h-80 w-96" title={tool.label} />
              <h2 className="mt-12 text-[1.25rem] leading-[1.3] tracking-[-0.01em]">{tool.label}</h2>
              <p className="mt-8 text-text-secondary">{tool.description}</p>
              {tool.comingSoon ? (
                <p className="mt-16 text-[12px] uppercase tracking-[0.05em] text-accent">Coming soon</p>
              ) : null}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
