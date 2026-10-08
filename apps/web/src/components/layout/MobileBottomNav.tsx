"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: "home" | "upscale" | "restore" | "history" | "more" };

const PRIMARY: NavItem[] = [
  { href: "/overview", label: "Home", icon: "home" },
  { href: "/tools/upscale", label: "Upscale", icon: "upscale" },
  { href: "/tools/restore", label: "Restore", icon: "restore" },
  { href: "/history", label: "History", icon: "history" },
];

const MORE: { href: string; label: string }[] = [
  { href: "/tools/background", label: "Background" },
  { href: "/tools/face", label: "Face" },
  { href: "/tools/video-upscale", label: "Video" },
  { href: "/presets", label: "Presets" },
  { href: "/usage", label: "Usage" },
  { href: "/settings", label: "Settings" },
  { href: "/", label: "Marketing site" },
];

function Icon({ name, active }: { name: NavItem["icon"]; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (name === "upscale") {
    return (
      <svg {...common}>
        <path d="M4 14v6h6" />
        <path d="m4 20 7-7" />
        <path d="M20 10V4h-6" />
        <path d="m20 4-7 7" />
      </svg>
    );
  }
  if (name === "restore") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M4 12a8 8 0 0 1 14.5-4.8" />
        <path d="M20 12a8 8 0 0 1-14.5 4.8" />
      </svg>
    );
  }
  if (name === "history") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MobileBottomNav({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const moreItems = showAdmin
    ? [...MORE.slice(0, -1), { href: "/admin", label: "Admin" }, MORE[MORE.length - 1]]
    : MORE;

  const moreActive = moreItems.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (sheetRef.current && !sheetRef.current.contains(target)) {
        const bar = document.getElementById("pf-mobile-tabbar");
        if (bar && bar.contains(target)) return;
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-brand-navy/35 backdrop-blur-[2px] lg:hidden" aria-hidden />
      ) : null}

      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 mx-12 mb-8 overflow-hidden rounded-[16px] border border-border bg-bg-elevated shadow-[0_-8px_40px_rgb(26_22_48/18%)] transition-all duration-200 lg:hidden ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
        }`}
        role="dialog"
        aria-label="More menu"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-18 py-14">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-text-muted uppercase">More</p>
          <button
            type="button"
            className="min-h-36 min-w-36 rounded-[8px] text-text-muted hover:bg-surface-2 hover:text-text"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-6">
          {moreItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-48 items-center px-18 text-[15px] font-medium ${
                    active ? "bg-accent-subtle text-accent" : "text-text hover:bg-surface-2"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <nav
        id="pf-mobile-tabbar"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Mobile app"
      >
        <ul className="mx-auto grid max-w-[560px] grid-cols-5">
          {PRIMARY.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-64 flex-col items-center justify-center gap-4 text-[10px] font-semibold tracking-[0.04em] ${
                    active ? "text-accent" : "text-text-muted"
                  }`}
                >
                  <Icon name={item.icon} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className={`flex min-h-64 w-full flex-col items-center justify-center gap-4 text-[10px] font-semibold tracking-[0.04em] ${
                open || moreActive ? "text-accent" : "text-text-muted"
              }`}
              aria-expanded={open}
              aria-controls="pf-more-sheet"
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name="more" active={open || moreActive} />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
