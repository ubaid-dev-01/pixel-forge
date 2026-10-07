import type { Metadata } from "next";
import Link from "next/link";
import { TOOL_CATALOG } from "@pixelforge/shared";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { BeforeAfterViewer } from "@/components/media/BeforeAfterViewer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IsoIcon, toolIcon, type IsoIconName } from "@/components/brand/IsoIcons";
import { SAMPLES } from "@/lib/samples";

const PILLARS: { icon: IsoIconName; title: string; copy: string }[] = [
  {
    icon: "restore",
    title: "Restore with named presets",
    copy: "Light, Balanced, or Strong — controlled repair, not a mystery filter.",
  },
  {
    icon: "upscale",
    title: "Upscale resolution honestly",
    copy: "Real-ESRGAN or classical Lanczos. You choose the mode; we label the sample.",
  },
  {
    icon: "compare",
    title: "Compare before you download",
    copy: "Slider, side-by-side, and zoom — inspect every job against the original.",
  },
  {
    icon: "privacy",
    title: "Private uploads by default",
    copy: "Signed objects, retention you control, and no fake “100% private” claims.",
  },
];

const USE_CASES: { icon: IsoIconName; title: string; copy: string }[] = [
  { icon: "archive", title: "Archive labs", copy: "Stabilize and restore scans without a desktop suite." },
  { icon: "studio", title: "Product studios", copy: "Remove backgrounds and keep the mask." },
  { icon: "editorial", title: "Editorial desks", copy: "Upscale reference stills with a recorded processing mode." },
];

export const metadata: Metadata = {
  title: "PixelForge — restore images & video",
  description:
    "Professional image infrastructure for people who care about visual quality. Restore, enhance, upscale, sharpen, and transform.",
  alternates: { canonical: "/" },
};

const faqs = [
  {
    q: "Does PixelForge run restoration models inside Vercel?",
    a: "No. The Next.js app on Vercel handles UI and auth. Jobs go to the Node API, then to a Python worker. PyTorch, GFPGAN, Real-ESRGAN, and FFmpeg do not run in the web request path.",
  },
  {
    q: "Are the landing comparisons live GFPGAN runs?",
    a: "No. Marketing comparisons are labeled Sample or Preprocessed. Live processing happens after you sign in and a worker is available.",
  },
  {
    q: "What happens if no face is found?",
    a: "Face restoration returns NO_FACES_DETECTED. PixelForge will not force GFPGAN on a landscape or product shot.",
  },
  {
    q: "Do you keep files forever?",
    a: "No. Default retention is 7 days. You can choose 24 hours or 30 days, and delete a job at any time. That removes input, output, and masks from object storage.",
  },
  {
    q: "Is GFPGAN commercially licensed?",
    a: "GFPGAN code is Apache 2.0. It incorporates a StyleGAN2 prior under NVIDIA terms that restrict some commercial uses of that component. See Model licenses.",
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
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
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

  return (
    <>
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />
      <Navbar />
      <main>
        {/* Full-bleed hero: brand copy + edge-to-edge compare plane */}
        <section className="relative min-h-[min(92vh,820px)] overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_10%,rgba(110,193,228,0.28),transparent_50%),radial-gradient(ellipse_at_85%_70%,rgba(30,130,162,0.12),transparent_45%)]"
          />
          <div className="relative grid min-h-[min(92vh,820px)] lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)]">
            <div className="relative z-10 flex flex-col justify-center px-28 py-56 sm:px-40 lg:px-48 lg:py-64">
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
                Restore · Enhance · Upscale · Sharpen · Transform
              </p>
              <h1 className="font-display mt-20 text-[clamp(2.85rem,5.5vw,4.85rem)] leading-[1.04] tracking-[-0.035em] text-brand-navy">
                See every pixel come back.
              </h1>
              <p className="mt-24 max-w-[36ch] text-[1.125rem] leading-[1.65] text-text-secondary">
                Image infrastructure for people who care about visual quality. Real jobs. Honest labels.
              </p>
              <div className="mt-36 flex flex-wrap gap-12">
                <Button href="/signup">Try the tool</Button>
                <Button href="/tools" variant="secondary">
                  Explore tools
                </Button>
              </div>
            </div>
            <div className="relative min-h-[520px] w-full lg:min-h-full">
              <HeroDemo />
            </div>
          </div>
        </section>

        <section className="bg-brand-navy">
          <div className="mx-auto max-w-[1200px] px-24 py-72">
            <div className="grid gap-48 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((item) => (
                <article key={item.title} className="flex flex-col items-center text-center">
                  <div className="flex h-140 w-full items-center justify-center">
                    <IsoIcon name={item.icon} className="h-120 w-140" title={item.title} />
                  </div>
                  <h3 className="font-display mt-20 text-[1.2rem] leading-[1.3] text-text-inverse">
                    {item.title}
                  </h3>
                  <p className="mt-10 text-[0.95rem] leading-[1.55] text-brand-light/90">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-24 py-64">
            <h2 className="font-display text-[36px] md:text-[48px]">A complete tool ecosystem</h2>
            <p className="mt-12 max-w-[640px] text-text-muted">
              Classical OpenCV pipelines and licensed restoration models share one job system. If a model is missing, the tool says so.
            </p>
            <div className="mt-32 grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
              {TOOL_CATALOG.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="rounded-[12px] border border-border bg-surface p-24 shadow-soft transition-colors duration-[150ms] hover:border-border-strong"
                >
                  <IsoIcon
                    name={toolIcon(tool.slug)}
                    className="h-80 w-96"
                    title={tool.shortLabel}
                  />
                  <p className="mt-12 text-[12px] uppercase tracking-[0.05em] text-text-subtle">{tool.category}</p>
                  <h3 className="mt-8 text-[1.25rem] leading-[1.3]">{tool.shortLabel}</h3>
                  <p className="mt-8 text-[1rem] leading-[1.6] text-text-secondary">{tool.description}</p>
                  {tool.comingSoon ? (
                    <p className="mt-16 text-[12px] uppercase tracking-[0.05em] text-accent">Coming soon</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <DemoSection
          icon="upscale"
          kicker="Image enhancement"
          title="Upscale without inventing a second photograph."
          sample={SAMPLES[0]}
        />
        <DemoSection
          icon="background"
          kicker="Background removal"
          title="Cutouts with a mask you can inspect."
          sample={SAMPLES[2]}
        />
        <DemoSection
          icon="restore"
          kicker="Photo restoration"
          title="Repair grain and fade with named presets."
          sample={SAMPLES[1]}
        />
        <DemoSection
          icon="color"
          kicker="Color restoration"
          title="Tonal repair, not a general editor."
          sample={SAMPLES[3]}
        />
        <DemoSection
          icon="sharpen"
          kicker="Landscape upscale"
          title="Sharpen a low-resolution scene without claiming a new photograph."
          sample={SAMPLES[4]}
        />
        <DemoSection
          icon="cleanup"
          kicker="Document cleanup"
          title="Stains and grain come off the scan, not the words."
          sample={SAMPLES[5]}
        />
        <DemoSection
          icon="video-sharpen"
          kicker="Video frame"
          title="Still frames standing in for video sharpen — labeled as samples."
          sample={SAMPLES[6]}
        />

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1200px] gap-32 px-24 py-64 lg:grid-cols-2">
            <div>
              <div className="mb-16 flex items-center gap-16">
                <IsoIcon name="workflow" className="h-80 w-96" title="Workflow" />
                <h2 className="font-display text-[36px]">Professional workflow</h2>
              </div>
              <ol className="mt-24 space-y-16 text-[16px] text-text-muted">
                <li>01 — Authenticate. Signed uploads only.</li>
                <li>02 — Validate MIME, size, and magic bytes.</li>
                <li>03 — Queue a job. The UI shows real worker stages.</li>
                <li>04 — Compare original and output. Download a signed URL.</li>
                <li>05 — History retains metadata after files expire.</li>
              </ol>
            </div>
            <div>
              <div className="mb-16 flex items-center gap-16">
                <IsoIcon name="convert" className="h-80 w-96" title="Formats" />
                <h2 className="font-display text-[36px]">Formats</h2>
              </div>
              <p className="mt-24 text-text-muted">Images: JPG, PNG, WebP, AVIF. Video: MP4, MOV, WebM, MKV in. MP4 and WebM out. Audio is preserved on video jobs that do not rasterize to a still.</p>
              <div className="mt-48 mb-16 flex items-center gap-16">
                <IsoIcon name="privacy" className="h-80 w-96" title="Privacy" />
                <h2 className="font-display text-[36px]">Privacy</h2>
              </div>
              <p className="mt-24 text-text-muted">
                Uploads are private objects with random keys. The Python worker never holds storage credentials. PixelForge does not claim “100% private” — operators of the worker can see files in memory during a job.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-24 py-64">
            <h2 className="font-display text-[36px]">Use cases</h2>
            <div className="mt-24 grid gap-16 md:grid-cols-3">
              {USE_CASES.map((item) => (
                <article key={item.title} className="rounded-[12px] border border-border bg-surface p-24 shadow-soft">
                  <IsoIcon name={item.icon} className="h-96 w-112" title={item.title} />
                  <h3 className="mt-16 text-[1.25rem] leading-[1.3]">{item.title}</h3>
                  <p className="mt-8 text-text-secondary">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-[800px] px-24 py-64">
            <h2 className="font-display text-[36px]">FAQ</h2>
            <div className="mt-32 space-y-24">
              {faqs.map((item) => (
                <article key={item.q}>
                  <h3 className="text-[18px]">{item.q}</h3>
                  <p className="mt-8 text-text-muted">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-24 px-24 py-64">
            <h2 className="font-display text-[48px]">Open a workspace.</h2>
            <Button href="/signup">Try the tool</Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DemoSection({
  icon,
  kicker,
  title,
  sample,
}: {
  icon: IsoIconName;
  kicker: string;
  title: string;
  sample: (typeof SAMPLES)[number];
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto grid max-w-[1200px] gap-32 px-24 py-64 lg:grid-cols-2 lg:items-center">
        <div>
          <IsoIcon name={icon} className="mb-16 h-88 w-108" title={kicker} />
          <p className="text-[12px] uppercase tracking-[0.05em] text-accent">{kicker}</p>
          <h2 className="font-display mt-12 text-[1.75rem] leading-[1.2] tracking-[-0.02em] md:text-[2.25rem]">
            {title}
          </h2>
          <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.05em] text-accent">{sample.label}</p>
          <p className="prose-measure mt-16 text-[1rem] leading-[1.6] text-text-secondary">{sample.note}</p>
        </div>
        <BeforeAfterViewer beforeSrc={sample.before} afterSrc={sample.after} />
      </div>
    </section>
  );
}
