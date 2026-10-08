"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Logo } from "@/components/brand/Logo";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { refs } from "@/lib/convexRefs";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/tools/upscale", label: "Upscale" },
  { href: "/tools/restore", label: "Restore" },
  { href: "/tools/background", label: "Background" },
  { href: "/tools/face", label: "Face" },
  { href: "/tools/video-upscale", label: "Video" },
  { href: "/history", label: "History" },
  { href: "/presets", label: "Presets" },
  { href: "/usage", label: "Usage" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const me = useQuery(refs.usersMe);
  const isAdmin = me?.role === "admin";

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[232px_1fr]">
      {/* Desktop sidebar only */}
      <aside className="hidden border-r border-border bg-bg-elevated lg:block">
        <div className="flex h-64 items-center px-20">
          <Link href="/overview" aria-label="Overview">
            <Logo size="md" />
          </Link>
        </div>
        <nav className="flex flex-col gap-2 px-10 pb-12" aria-label="Workspace">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-40 whitespace-nowrap rounded-[6px] px-12 py-10 text-[14px] font-medium transition-colors duration-150 ${
                  active
                    ? "bg-accent-subtle text-accent"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              className={`mt-8 min-h-40 whitespace-nowrap rounded-[6px] px-12 py-10 text-[14px] font-medium transition-colors duration-150 ${
                pathname.startsWith("/admin")
                  ? "bg-accent-subtle text-accent"
                  : "text-text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              Admin
            </Link>
          ) : null}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-56 items-center justify-between gap-16 border-b border-border bg-bg-elevated/95 px-16 backdrop-blur-md sm:px-24">
          <Link href="/overview" className="lg:hidden" aria-label="Overview">
            <Logo size="md" />
          </Link>
          <p className="hidden truncate text-[13px] text-text-muted sm:block lg:flex-1">
            {me?.email ?? "Signed in"}
          </p>
          <Link href="/" className="shrink-0 text-[12px] font-medium text-text-muted hover:text-text">
            Site
          </Link>
        </div>
        <div className="px-16 py-24 pb-[calc(88px+env(safe-area-inset-bottom))] sm:px-24 sm:py-32 lg:px-32 lg:pb-32">
          {children}
        </div>
      </div>

      <MobileBottomNav showAdmin={Boolean(isAdmin)} />
    </div>
  );
}
