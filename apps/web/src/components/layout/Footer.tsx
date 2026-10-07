import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1200px] gap-32 px-24 py-64 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-16 max-w-[420px] text-[15px] text-text-muted">
            Professional image and video restoration. Files stay in private object storage. Metadata lives in Convex. Heavy inference never runs on the web request path.
          </p>
        </div>
        <div className="flex flex-col gap-12 text-[15px]">
          <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">Product</p>
          <Link href="/tools">Tools</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/docs/architecture">Architecture</Link>
        </div>
        <div className="flex flex-col gap-12 text-[15px]">
          <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">Legal</p>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/acceptable-use">Acceptable use</Link>
          <Link href="/legal/licenses">Model licenses</Link>
        </div>
      </div>
    </footer>
  );
}
