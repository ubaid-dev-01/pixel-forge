"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { docsNav, searchDocs } from "@/lib/docs";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLInputElement>(null);
  const nav = docsNav();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return nav;
    const hits = new Set(searchDocs(query).map((page) => page.slug));
    return nav
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) => hits.has(page.slug)),
      }))
      .filter((group) => group.pages.length > 0);
  }, [nav, query]);

  const hits = useMemo(() => searchDocs(query).slice(0, 10), [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setQuery("");
      }
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (palette) paletteRef.current?.focus();
  }, [palette]);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg">
        <div className="mx-auto flex h-64 max-w-[1440px] items-center gap-16 px-16 md:px-24">
          <Link href="/" aria-label="PixelForge home">
            <Logo />
          </Link>
          <span className="hidden text-text-subtle md:inline">/</span>
          <Link href="/docs" className="hidden text-[15px] text-text-muted hover:text-text md:inline">
            Docs
          </Link>
          <div className="relative ml-auto min-w-0 flex-1 md:max-w-[460px]">
            <label className="sr-only" htmlFor="docs-search">
              Search documentation
            </label>
            <input
              ref={inputRef}
              id="docs-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setPalette(true)}
              placeholder="Search docs"
              className="min-h-44 w-full rounded-[8px] border border-border bg-surface px-12 pr-72 text-[15px] text-text shadow-soft placeholder:text-text-subtle"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-12 hidden -translate-y-1/2 rounded-[6px] border border-border px-8 py-4 font-mono text-[11px] text-text-subtle md:inline">
              Ctrl K
            </kbd>
          </div>
          <Link href="/tools" className="hidden text-[14px] text-text-muted hover:text-text lg:inline">
            Tools
          </Link>
          <button
            type="button"
            className="min-h-44 px-12 text-[14px] text-text-muted lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </header>
      {palette ? (
        <div className="fixed inset-0 z-40 bg-overlay" onClick={() => setPalette(false)}>
          <div
            className="mx-auto mt-80 max-w-[640px] border border-border bg-surface-2 shadow-soft"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-label="Search documentation"
          >
            <input
              ref={paletteRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find an article, error code, or command"
              className="min-h-56 w-full border-b border-border bg-transparent px-16 text-[16px] text-text placeholder:text-text-subtle"
              onKeyDown={(event) => {
                if (event.key === "Enter" && hits[0]) {
                  router.push(`/docs/${hits[0].slug}`);
                  setPalette(false);
                  setQuery("");
                }
              }}
            />
            <ul className="max-h-[420px] overflow-y-auto py-8">
              {query.trim().length < 2 ? (
                <li className="px-16 py-12 text-[14px] text-text-subtle">Type at least two characters. Try “GFPGAN”, “env”, or “NO_FACES”.</li>
              ) : hits.length === 0 ? (
                <li className="px-16 py-12 text-[14px] text-text-muted">No articles match “{query}”.</li>
              ) : (
                hits.map((hit) => (
                  <li key={hit.slug}>
                    <Link
                      href={`/docs/${hit.slug}`}
                      className="block px-16 py-12 hover:bg-surface-3"
                      onClick={() => {
                        setPalette(false);
                        setQuery("");
                      }}
                    >
                      <span className="text-[16px] text-text">{hit.title}</span>
                      <span className="mt-4 block text-[13px] text-text-subtle">
                        {hit.section} — {hit.summary}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[260px_1fr]">
        <aside className={`${open ? "block" : "hidden"} border-b border-border lg:block lg:border-b-0 lg:border-r`}>
          <nav className="sticky top-64 max-h-[calc(100vh-64px)] overflow-y-auto px-16 py-24" aria-label="Documentation">
            {filtered.length === 0 ? (
              <p className="px-8 text-[14px] text-text-muted">No matching pages.</p>
            ) : (
              filtered.map((group) => (
                <div key={group.section} className="mb-24">
                  <p className="px-8 text-[12px] uppercase tracking-[0.16em] text-text-subtle">{group.section}</p>
                  <ul className="mt-8">
                    {group.pages.map((page) => {
                      const href = `/docs/${page.slug}`;
                      const active = pathname === href;
                      return (
                        <li key={page.slug}>
                          <Link
                            href={href}
                            className={`block min-h-44 px-8 py-8 text-[15px] transition-colors duration-[150ms] ${active ? "border-l-2 border-accent bg-accent-subtle text-text" : "text-text-secondary hover:text-text"}`}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                          >
                            {page.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
