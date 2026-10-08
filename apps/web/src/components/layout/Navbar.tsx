"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

const LINKS = [
  ["/tools", "Tools"],
  ["/docs", "Docs"],
  ["/legal/privacy", "Privacy"],
] as const;

export function Navbar({ variant = "page" }: { variant?: "hero" | "page" }) {
  const hero = variant === "hero";
  const [open, setOpen] = useState(false);

  return (
    <header
      className={
        hero
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-72 max-w-[1280px] items-center justify-between px-24 sm:px-40">
        <Link href="/" aria-label="PixelForge home" className="relative">
          <Logo size="lg" inverted={hero} />
        </Link>
        <nav
          className={`hidden items-center gap-32 tracking-[0.14em] uppercase md:flex ${
            hero ? "text-text-inverse/85" : "text-text-secondary"
          }`}
          aria-label="Primary"
        >
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`text-[12px] font-semibold transition-colors duration-200 ${
                hero ? "hover:text-brand-light" : "hover:text-accent"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            href="/signin"
            className={
              hero
                ? "hidden text-[13px] tracking-[0.08em] text-text-inverse/85 uppercase hover:bg-white/10 hover:text-text-inverse sm:inline-flex"
                : "hidden text-[13px] tracking-[0.08em] uppercase sm:inline-flex"
            }
          >
            Sign in
          </Button>
          <Button
            href="/signup"
            className={
              hero
                ? "hidden bg-brand-light px-18 text-[13px] tracking-[0.08em] text-brand-navy uppercase hover:bg-[#ffe680] sm:inline-flex"
                : "hidden px-18 text-[13px] tracking-[0.08em] uppercase sm:inline-flex"
            }
          >
            Open workspace
          </Button>
          <button
            type="button"
            className={`inline-flex min-h-44 min-w-44 items-center justify-center rounded-[8px] md:hidden ${
              hero ? "text-text-inverse hover:bg-white/10" : "text-text hover:bg-surface-2"
            }`}
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex flex-col gap-5" aria-hidden>
              <span className={`block h-[2px] w-18 ${hero ? "bg-text-inverse" : "bg-text"}`} />
              <span className={`block h-[2px] w-18 ${hero ? "bg-text-inverse" : "bg-text"}`} />
              <span className={`block h-[2px] w-12 ${hero ? "bg-brand-light" : "bg-accent"}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          className={`border-t md:hidden ${
            hero ? "border-white/10 bg-brand-navy/95 text-text-inverse" : "border-border bg-bg-elevated"
          }`}
        >
          <nav className="mx-auto flex max-w-[1280px] flex-col gap-4 px-24 py-16 sm:px-40" aria-label="Mobile">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="min-h-44 py-10 text-[15px] font-semibold tracking-[0.08em] uppercase"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-8 border-t border-current/10 pt-16">
              <Button href="/signin" variant="secondary" className={hero ? "border-text-inverse/40 text-text-inverse" : undefined}>
                Sign in
              </Button>
              <Button
                href="/signup"
                className={hero ? "bg-brand-light text-brand-navy hover:bg-[#ffe680]" : undefined}
              >
                Open workspace
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
