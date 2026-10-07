import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[720px] px-24 py-64">
        <h1 className="font-display text-[40px]">Privacy Policy</h1>
        <p className="mt-16 text-text-muted">Effective 7 October 2026. PixelForge processes media you upload to produce restored outputs.</p>
        <h2 className="mt-32 text-[20px]">What we store</h2>
        <p className="mt-12 text-text-muted">Account email and profile in Convex. Object keys, job parameters, dimensions, and error codes in Convex. Binary files in private object storage, not in Convex.</p>
        <h2 className="mt-32 text-[20px]">Retention</h2>
        <p className="mt-12 text-text-muted">Default 7 days. You may choose 24 hours or 30 days and may delete a job immediately. Expired objects are removed from storage. Metadata may remain for audit and usage accounting.</p>
        <h2 className="mt-32 text-[20px]">Processing</h2>
        <p className="mt-12 text-text-muted">A worker downloads a signed URL, runs OpenCV, Pillow, FFmpeg, and optionally GFPGAN / Real-ESRGAN / rembg, then uploads the result. Pixels exist in worker memory during the job.</p>
        <h2 className="mt-32 text-[20px]">What we do not claim</h2>
        <p className="mt-12 text-text-muted">PixelForge does not claim that files are “100% private” or that no operator can ever see them. Self-hosted deployments are under your control.</p>
      </main>
      <Footer />
    </>
  );
}
