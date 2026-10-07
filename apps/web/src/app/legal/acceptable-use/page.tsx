import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AupPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[720px] px-24 py-64">
        <h1 className="font-display text-[40px]">Acceptable Use</h1>
        <ul className="mt-16 list-disc space-y-8 pl-24 text-text-muted">
          <li>No child sexual abuse material.</li>
          <li>No non-consensual intimate imagery.</li>
          <li>No attempts to evade authentication or steal other users’ jobs.</li>
          <li>No malware in uploaded containers.</li>
          <li>No scraping the API beyond documented rate limits.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
