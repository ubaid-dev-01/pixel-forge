import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/tools/upscale", label: "Enhance image" },
  { href: "/tools/background", label: "Remove background" },
  { href: "/tools/restore", label: "Restore photo" },
  { href: "/tools/video-upscale", label: "Enhance video" },
  { href: "/history", label: "History" },
  { href: "/presets", label: "Presets" },
  { href: "/usage", label: "Usage" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex h-64 items-center px-20">
          <Link href="/overview" aria-label="Overview">
            <Logo />
          </Link>
        </div>
        <nav className="flex gap-8 overflow-x-auto px-12 py-12 lg:flex-col" aria-label="Workspace">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-44 whitespace-nowrap px-12 py-12 text-[15px] text-text-muted hover:bg-surface hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <div className="flex h-64 items-center justify-end border-b border-border px-24">
          <Link href="/" className="text-[14px] text-text-muted hover:text-text">
            Marketing site
          </Link>
        </div>
        <div className="px-24 py-32">{children}</div>
      </div>
    </div>
  );
}
