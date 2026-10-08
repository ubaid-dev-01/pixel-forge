import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg text-text">
      <div className="mx-auto grid max-w-[1180px] gap-40 px-24 py-64 sm:px-40 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-18 max-w-[380px] text-[14px] leading-[1.7] text-text-muted">
            Image and video restoration with private object storage, Convex metadata, and inference off the web request path.
          </p>
        </div>
        <div className="flex flex-col gap-12 text-[14px]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-text-subtle uppercase">Product</p>
          <Link href="/tools" className="hover:text-accent">
            Tools
          </Link>
          <Link href="/docs" className="hover:text-accent">
            Documentation
          </Link>
          <Link href="/docs/architecture" className="hover:text-accent">
            Architecture
          </Link>
        </div>
        <div className="flex flex-col gap-12 text-[14px]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-text-subtle uppercase">Legal</p>
          <Link href="/legal/privacy" className="hover:text-accent">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:text-accent">
            Terms
          </Link>
          <Link href="/legal/acceptable-use" className="hover:text-accent">
            Acceptable use
          </Link>
          <Link href="/legal/licenses" className="hover:text-accent">
            Model licenses
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[1180px] px-24 py-16 font-mono text-[11px] tracking-[0.06em] text-text-subtle sm:px-40">
          © {new Date().getFullYear()} PixelForge · Clarity City · #FFD84D · #7357D8 · #F8F7F2
        </p>
      </div>
    </footer>
  );
}
