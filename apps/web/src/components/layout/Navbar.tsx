import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-80 max-w-[1200px] items-center justify-between px-24">
        <Link href="/" aria-label="PixelForge home">
          <Logo size="lg" />
        </Link>
        <nav className="hidden items-center gap-24 sm:flex" aria-label="Primary">
          <Link href="/tools" className="text-[15px] text-text-secondary transition-colors duration-[150ms] hover:text-text">
            Tools
          </Link>
          <Link href="/docs" className="text-[15px] text-text-secondary transition-colors duration-[150ms] hover:text-text">
            Docs
          </Link>
          <Link href="/legal/privacy" className="text-[15px] text-text-secondary transition-colors duration-[150ms] hover:text-text">
            Privacy
          </Link>
        </nav>
        <div className="flex items-center gap-8">
          <Button variant="ghost" href="/signin">
            Sign in
          </Button>
          <Button href="/signup">Try the tool</Button>
        </div>
      </div>
    </header>
  );
}
