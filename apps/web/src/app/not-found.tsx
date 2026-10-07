import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[560px] px-24 py-64">
        <h1 className="font-display text-[40px]">Page not found</h1>
        <p className="mt-12 text-text-muted">That route is not part of PixelForge.</p>
        <div className="mt-24">
          <Button href="/">Back to the product</Button>
        </div>
      </main>
    </>
  );
}
