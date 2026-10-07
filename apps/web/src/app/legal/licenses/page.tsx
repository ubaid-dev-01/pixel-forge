import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LicensesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[800px] px-24 py-64">
        <h1 className="font-display text-[40px]">Model and third-party licenses</h1>
        <div className="mt-32 space-y-32 text-text-muted">
          <section>
            <h2 className="text-[20px] text-text">GFPGAN</h2>
            <p className="mt-8">Source: TencentARC/GFPGAN. Purpose: blind face restoration. Code license: Apache 2.0. Weights: GFPGANv1.4.pth from GitHub releases (~348MB). CPU and GPU. Not serverless; run in a persistent worker. Fallback: fail with MODEL_UNAVAILABLE or NO_FACES_DETECTED. Third-party StyleGAN2 prior includes NVIDIA license terms that limit some commercial uses of that component. Review LICENSE in the upstream repository before selling GFPGAN-backed inference.</p>
          </section>
          <section>
            <h2 className="text-[20px] text-text">Real-ESRGAN</h2>
            <p className="mt-8">Source: xinntao/Real-ESRGAN. BSD-3-Clause. Commercial use permitted with attribution. Weights: RealESRGAN_x4plus.pth (~64MB). CPU slow; GPU recommended. Tile size required for large images. Fallback: user-selected Lanczos only.</p>
          </section>
          <section>
            <h2 className="text-[20px] text-text">BiRefNet</h2>
            <p className="mt-8">Source: ZhengPeng7/BiRefNet. MIT code and official Hugging Face weights. Commercial use permitted with notice. Do not substitute BRIA RMBG-2.0 weights (CC BY-NC).</p>
          </section>
          <section>
            <h2 className="text-[20px] text-text">rembg + U²-Net</h2>
            <p className="mt-8">rembg: MIT (code). U²-Net: Apache 2.0. Default background-removal fallback. ONNX Runtime, CPU capable. ~176MB u2net.onnx.</p>
          </section>
          <section>
            <h2 className="text-[20px] text-text">Not shipped</h2>
            <p className="mt-8">BRIA RMBG 1.4 and 2.0 — non-commercial without a BRIA agreement. IS-Net general-use weights — license for weights is not clearly granted. RIFE interpolation — not enabled until a licensed model is configured.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
