import type { Metadata } from "next";
import Link from "next/link";
import { TOOL_CATALOG } from "@pixelforge/shared";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { Marquee } from "@/components/landing/Marquee";
import { PolaroidStack } from "@/components/landing/PolaroidStack";
import { PrecisionFrame } from "@/components/landing/PrecisionFrame";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { BeforeAfterViewer } from "@/components/media/BeforeAfterViewer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SAMPLES } from "@/lib/samples";

export const metadata: Metadata = {
  title: "PixelForge — restore images & video",
  description:
    "Professional image infrastructure for people who care about visual quality. Restore, enhance, upscale, sharpen, and transform.",
  alternates: { canonical: "/" },
};

const faqs = [
  {
    q: "Does PixelForge run restoration models inside Vercel?",
    a: "No. The Next.js app on Vercel handles UI and auth. Jobs go to the Node API, then to a Python worker.",
  },
  {
    q: "Are the landing comparisons live model runs?",
    a: "No. Marketing comparisons are labeled Sample or Preprocessed. Live processing happens after you sign in.",
  },
  {
    q: "Do you keep files forever?",
    a: "No. Default retention is 7 days. Choose 24 hours or 30 days, or delete a job anytime.",
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixelforge.app";

export default function HomePage() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PixelForge",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "Professional image upscaling, restoration, background removal, and video enhancement platform.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const featured = TOOL_CATALOG.filter((t) =>
    ["upscale", "restore", "background", "face", "cleanup", "video-upscale"].includes(t.slug),
  );

  return (
    <>
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />
      <Navbar variant="hero" />
      <main>
        {/* Hero — brand first, one composition, full-bleed compare */}
        <section className="relative min-h-[100svh] overflow-hidden bg-brand-navy">
          <HeroDemo />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(12_17_39/70%)_0%,rgb(12_17_39/25%)_42%,rgb(12_17_39/78%)_100%)]"
          />
          <div aria-hidden className="pf-grid-fade pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative z-20 flex min-h-[100svh] flex-col justify-end px-24 pb-56 sm:px-40 sm:pb-72 lg:px-56">
            <div className="mx-auto w-full max-w-[1180px]">
              <p className="pf-rise font-display text-[clamp(3.2rem,9vw,7.5rem)] font-bold tracking-[-0.055em] text-text-inverse">
                PixelForge
              </p>
              <div className="pf-line-in mt-8 h-px w-80 max-w-[40%] bg-brand-teal" />
              <h1 className="pf-rise-delay font-display mt-22 max-w-[22ch] text-[clamp(1.35rem,2.6vw,2rem)] font-semibold tracking-[-0.025em] text-text-inverse/95">
                Restore the detail your images lost.
              </h1>
              <p className="pf-fade-in mt-14 max-w-[38ch] text-[15px] leading-[1.65] text-text-inverse/70">
                Professional restoration infrastructure — honest labels, real workers, no mystery filters.
              </p>
              <div className="pf-fade-in mt-28 flex flex-wrap items-center gap-12">
                <Button
                  href="/signup"
                  className="bg-brand-light px-22 text-[13px] tracking-[0.1em] text-brand-navy uppercase hover:bg-[#e8f4f8]"
                >
                  Open workspace
                </Button>
                <Button
                  href="/tools"
                  variant="secondary"
                  className="border-text-inverse/40 px-22 text-[13px] tracking-[0.1em] text-text-inverse uppercase hover:bg-white/10"
                >
                  View tools
                </Button>
                <span className="hidden items-center gap-10 font-mono text-[10px] tracking-[0.16em] text-text-inverse/55 uppercase sm:inline-flex">
                  <span className="h-6 w-6 rounded-full bg-brand-teal" />
                  Drag to compare
                </span>
              </div>
            </div>
          </div>
        </section>

        <Marquee />

        {/* Manifesto + archive stack */}
        <section className="pf-atmosphere relative overflow-hidden">
          <div className="mx-auto grid max-w-[1180px] items-center gap-48 px-24 py-96 sm:px-40 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Manifesto</p>
              <h2 className="font-display mt-16 text-[clamp(2rem,4vw,3.4rem)] font-bold tracking-[-0.035em] text-brand-navy">
                Precision for ruined frames.
              </h2>
              <p className="mt-24 max-w-[38ch] text-[1.12rem] leading-[1.7] text-text-secondary">
                Classical pipelines and licensed models share one job system. If a model is missing,{" "}
                <span className="border-b border-brand-teal/50 font-semibold text-brand-navy">
                  we say so
                </span>
                . No silent swaps. No fake AI magic.
              </p>
              <ul className="mt-32 space-y-14">
                {[
                  "Signed uploads into private object storage",
                  "Named processors — GFPGAN, Real-ESRGAN, FFmpeg, OpenCV",
                  "Retention you control: 24h · 7d · 30d",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-12 text-[0.95rem] text-text-secondary">
                    <span aria-hidden className="mt-8 h-6 w-6 shrink-0 bg-brand-teal" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-40 flex flex-wrap gap-12">
                <Button href="/signup" className="uppercase tracking-[0.08em]">
                  Start restoring
                </Button>
                <Button href="/docs" variant="secondary" className="uppercase tracking-[0.08em]">
                  Read the docs
                </Button>
              </div>
            </div>
            <PolaroidStack />
          </div>
        </section>

        {/* Process rail */}
        <section className="border-y border-border bg-bg-elevated">
          <div className="mx-auto max-w-[1180px] px-24 py-80 sm:px-40">
            <div className="mb-48 flex flex-wrap items-end justify-between gap-16">
              <div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Pipeline</p>
                <h2 className="font-display mt-12 text-[clamp(1.7rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-brand-navy">
                  Upload → Process → Compare
                </h2>
              </div>
              <p className="max-w-[32ch] text-[0.92rem] leading-[1.6] text-text-muted">
                Heavy inference never runs inside a Vercel request. The web app stays fast; workers do the work.
              </p>
            </div>
            <ProcessSteps />
          </div>
        </section>

        {/* Editorial split — full-bleed visual */}
        <section className="bg-brand-navy">
          <div className="mx-auto grid max-w-[1280px] lg:grid-cols-[1.2fr_0.8fr]">
            <PrecisionFrame className="relative min-h-[420px] overflow-hidden lg:min-h-[620px]" label="Preprocessed sample">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SAMPLES[4]?.after ?? SAMPLES[0].after}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/75 via-transparent to-brand-navy/20" />
              <div className="absolute inset-x-0 bottom-0 p-28 sm:p-40">
                <p className="font-display max-w-[16ch] text-[clamp(1.6rem,3vw,2.5rem)] font-bold tracking-[-0.025em] text-text-inverse">
                  Find what your image lost.
                </p>
              </div>
            </PrecisionFrame>
            <div className="flex flex-col justify-center gap-28 border-t border-white/10 px-28 py-48 sm:px-40 lg:border-t-0 lg:border-l">
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SAMPLES[3]?.before ?? SAMPLES[0].before}
                  alt=""
                  className="aspect-[16/10] w-full object-cover opacity-90"
                />
                <span className="absolute top-12 left-12 font-mono text-[10px] tracking-[0.16em] text-text-inverse/80 uppercase">
                  Faded source
                </span>
              </div>
              <div>
                <h2 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-text-inverse">
                  Compare before you keep it
                </h2>
                <p className="mt-14 text-[0.98rem] leading-[1.65] text-text-inverse/65">
                  Every finished job opens against the original. Slider, side-by-side, zoom — then download a signed URL.
                </p>
                <Button
                  href="/signup"
                  className="mt-28 bg-brand-light text-brand-navy uppercase tracking-[0.08em] hover:bg-[#e8f4f8]"
                >
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tools — editorial rows, not generic card grid */}
        <section className="bg-bg">
          <div className="mx-auto max-w-[1180px] px-24 py-96 sm:px-40">
            <div className="flex flex-wrap items-end justify-between gap-16 border-b border-border pb-28">
              <div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Toolkit</p>
                <h2 className="font-display mt-12 text-[clamp(1.7rem,3vw,2.5rem)] font-bold tracking-[-0.03em] text-brand-navy">
                  Essentials that deliver
                </h2>
              </div>
              <Link
                href="/tools"
                className="text-[13px] font-semibold tracking-[0.1em] text-accent uppercase transition-colors hover:text-accent-hover"
              >
                See all →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {featured.map((tool, i) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-16 py-22 transition-colors sm:gap-24 sm:py-26"
                  >
                    <span className="font-mono text-[11px] tracking-[0.12em] text-text-subtle tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-brand-navy transition-colors group-hover:text-accent sm:text-[1.35rem]">
                        {tool.shortLabel}
                      </span>
                      <span className="mt-6 block max-w-[48ch] text-[0.9rem] leading-[1.55] text-text-muted">
                        {tool.description}
                      </span>
                    </span>
                    <span className="hidden font-mono text-[10px] tracking-[0.14em] text-text-subtle uppercase sm:block">
                      {tool.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Workspace band — navy, no decorative cards */}
        <section className="relative overflow-hidden bg-brand-deep text-text-inverse">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#FDFCFA 1px, transparent 1px), linear-gradient(90deg, #FDFCFA 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative mx-auto max-w-[1180px] px-24 py-88 sm:px-40">
            <p className="font-mono text-[11px] tracking-[0.18em] text-brand-teal uppercase">Workspace</p>
            <h2 className="font-display mt-14 max-w-[18ch] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.03em]">
              Your complete restoration desk
            </h2>
            <p className="mt-16 max-w-[42ch] text-[1.05rem] leading-[1.65] text-text-inverse/70">
              Jobs, history, presets, usage — one workspace. Heavy inference never runs on the web request path.
            </p>
            <div className="mt-48 grid gap-0 border-t border-white/15 sm:grid-cols-3">
              {[
                { src: SAMPLES[1].after, title: "Portrait repair", note: "Grain · compression" },
                { src: SAMPLES[0].after, title: "Detail upscale", note: "Classical or AI" },
                { src: SAMPLES[2].after, title: "Clean cutouts", note: "Mask you can keep" },
              ].map((item, i) => (
                <article
                  key={item.title}
                  className={`group relative overflow-hidden ${i > 0 ? "border-t border-white/15 sm:border-t-0 sm:border-l" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt=""
                    className="aspect-[5/4] w-full object-cover opacity-85 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/90 to-transparent p-20 pt-48">
                    <p className="font-display text-[1.05rem] font-semibold">{item.title}</p>
                    <p className="mt-4 font-mono text-[10px] tracking-[0.14em] text-brand-teal uppercase">
                      {item.note}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Live compare */}
        <section className="bg-bg">
          <div className="mx-auto max-w-[920px] px-24 py-96 sm:px-40">
            <div className="text-center">
              <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">Proof</p>
              <h2 className="font-display mt-12 text-[clamp(1.7rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-brand-navy">
                Drag the truth
              </h2>
              <p className="mx-auto mt-14 max-w-[40ch] text-text-muted">
                Preprocessed sample — not a live model run. Real jobs start after sign-in.
              </p>
            </div>
            <PrecisionFrame className="mt-40 overflow-hidden border border-border bg-bg-elevated shadow-soft">
              <BeforeAfterViewer beforeSrc={SAMPLES[0].before} afterSrc={SAMPLES[0].after} />
            </PrecisionFrame>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-bg-elevated">
          <div className="mx-auto max-w-[760px] px-24 py-80 sm:px-40">
            <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">FAQ</p>
            <h2 className="font-display mt-12 text-[2rem] font-bold text-brand-navy">Straight answers</h2>
            <div className="mt-36 divide-y divide-border border-y border-border">
              {faqs.map((item) => (
                <details key={item.q} className="group py-22">
                  <summary className="cursor-pointer list-none font-semibold text-brand-navy marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-16">
                      <span className="text-[1.02rem] leading-[1.45]">{item.q}</span>
                      <span
                        aria-hidden
                        className="mt-4 inline-flex h-22 w-22 shrink-0 items-center justify-center border border-border font-mono text-[14px] text-accent transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-14 max-w-[52ch] text-[0.95rem] leading-[1.65] text-text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-brand-navy text-text-inverse">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgb(30_130_162/28%),transparent_68%)]"
          />
          <div className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-20 px-24 py-96 sm:px-40">
            <p className="pf-giant text-[clamp(3.5rem,12vw,8rem)] text-text-inverse/[0.12]">FORGE</p>
            <h2 className="font-display -mt-24 max-w-[16ch] text-[clamp(1.7rem,3.2vw,2.6rem)] font-bold tracking-[-0.025em]">
              Open a workspace. Bring every pixel back.
            </h2>
            <p className="max-w-[36ch] text-[15px] leading-[1.65] text-text-inverse/65">
              Upscale, restore, denoise, cut out, enhance video — one honest pipeline.
            </p>
            <div className="mt-8 flex flex-wrap gap-12">
              <Button
                href="/signup"
                className="bg-brand-light text-brand-navy uppercase tracking-[0.1em] hover:bg-[#e8f4f8]"
              >
                Create account
              </Button>
              <Button
                href="/tools"
                variant="secondary"
                className="border-text-inverse/35 text-text-inverse uppercase tracking-[0.1em] hover:bg-white/10"
              >
                Browse tools
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
