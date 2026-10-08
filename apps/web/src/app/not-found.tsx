import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[560px] px-24 py-64">
      <p className="text-[12px] uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="font-display mt-12 text-[40px]">Page not found</h1>
      <p className="mt-12 text-text-muted">That route is not part of PixelForge.</p>
      <Link
        href="/"
        className="mt-24 inline-flex h-48 items-center rounded-md bg-brand-navy px-24 text-[14px] font-semibold text-text-inverse"
      >
        Back to the product
      </Link>
    </main>
  );
}
