import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[720px] px-24 py-64">
        <h1 className="font-display text-[40px]">Terms of Service</h1>
        <p className="mt-16 text-text-muted">You must have the right to process the media you upload. Outputs are provided as-is. Restoration models can alter identity-sensitive facial details; review results before publishing.</p>
        <p className="mt-16 text-text-muted">Usage limits may apply. Billing is not enabled in this codebase. Do not upload illegal content. We may delete files that violate acceptable use.</p>
      </main>
      <Footer />
    </>
  );
}
