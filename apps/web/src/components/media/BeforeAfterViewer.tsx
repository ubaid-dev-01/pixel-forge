"use client";

/* Comparison viewer — images always cover the frame (object-cover). */

import { useCallback, useEffect, useRef, useState } from "react";
import { frameLoadFailure } from "@/lib/download";

const ZOOMS = [25, 50, 100, 200, "fit"] as const;

type ViewerProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  mode?: "slider" | "side" | "stack";
  /** Hide mode/zoom chrome — for hero and tight layouts */
  compact?: boolean;
  /** Frame aspect, default 16/10 */
  aspectClass?: string;
  className?: string;
};

export function BeforeAfterViewer({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Enhanced",
  mode = "slider",
  compact = false,
  aspectClass = "aspect-[16/10]",
  className,
}: ViewerProps) {
  const [position, setPosition] = useState(50);
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>("fit");
  const [viewMode, setViewMode] = useState(mode);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState(false);
  const dragging = useRef(false);

  useEffect(() => {
    setLoadError(false);
  }, [beforeSrc, afterSrc]);

  const onPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = ((event.clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const scale = zoom === "fit" ? 1 : zoom / 100;

  return (
    <div className={`flex flex-col gap-12 ${className ?? ""}`}>
      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-12">
          <div className="flex gap-4" role="tablist" aria-label="Comparison mode">
            {(["slider", "side", "stack"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={viewMode === item}
                className={`min-h-44 rounded-[8px] px-12 text-[12px] uppercase tracking-[0.05em] transition-colors duration-[150ms] ${viewMode === item ? "bg-surface-2 text-text" : "text-text-muted hover:text-text"}`}
                onClick={() => setViewMode(item)}
              >
                {item === "slider" ? "Slider" : item === "side" ? "Side by side" : "Top / bottom"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {ZOOMS.map((item) => (
              <button
                key={String(item)}
                type="button"
                className={`min-h-44 min-w-44 rounded-[8px] px-8 text-[12px] uppercase tracking-[0.05em] transition-colors duration-[150ms] ${zoom === item ? "text-accent" : "text-text-muted hover:text-text"}`}
                onClick={() => {
                  setZoom(item);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                {item === "fit" ? "Fit" : `${item}%`}
              </button>
            ))}
            <button
              type="button"
              className="min-h-44 rounded-[8px] px-12 text-[12px] uppercase tracking-[0.05em] text-text-muted transition-colors duration-[150ms] hover:text-text"
              onClick={() => {
                setZoom("fit");
                setOffset({ x: 0, y: 0 });
                setPosition(50);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <p className="rounded-[12px] border border-danger p-16 text-[14px] text-text-muted">
          {frameLoadFailure(beforeSrc, afterSrc) === "samples" ? (
            <>
              Sample media failed to load. From the repo root run{" "}
              <code className="font-mono text-text">npm run fetch:samples</code>.
            </>
          ) : (
            "This result could not be displayed. Sign in again, then process the image once more."
          )}
        </p>
      ) : null}

      {viewMode === "slider" ? (
        <div
          className={`relative ${aspectClass} cursor-ew-resize overflow-hidden bg-brand-deep ${compact ? "h-full w-full" : "rounded-[12px] border border-border"}`}
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            onPointer(event);
          }}
          onPointerMove={(event) => {
            if (dragging.current) onPointer(event);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          role="slider"
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setPosition((value) => Math.max(0, value - 2));
            if (event.key === "ArrowRight") setPosition((value) => Math.min(100, value + 2));
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={afterSrc}
              alt={afterLabel}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              onError={() => setLoadError(true)}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeSrc}
              alt={beforeLabel}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              onError={() => setLoadError(true)}
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 w-[2px] bg-text-inverse"
            style={{ left: `${position}%` }}
          >
            <span className="absolute top-1/2 left-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-text-inverse bg-brand-navy/80 shadow-soft backdrop-blur-sm">
              <span className="text-[11px] font-medium tracking-wide text-text-inverse">⟷</span>
            </span>
          </div>
          <div className="pointer-events-none absolute top-16 left-16 rounded-[6px] bg-brand-navy/75 px-10 py-5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-inverse backdrop-blur-sm">
            {beforeLabel}
          </div>
          <div className="pointer-events-none absolute top-16 right-16 rounded-[6px] bg-brand-navy/75 px-10 py-5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-inverse backdrop-blur-sm">
            {afterLabel}
          </div>
        </div>
      ) : (
        <div className={viewMode === "side" ? "grid gap-16 md:grid-cols-2" : "grid gap-16"}>
          <figure className={`relative overflow-hidden rounded-[12px] border border-border bg-brand-navy ${aspectClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 h-full w-full object-cover" />
            <figcaption className="absolute bottom-0 left-0 right-0 bg-brand-navy/70 px-12 py-8 text-[12px] uppercase tracking-[0.05em] text-text-inverse backdrop-blur-sm">
              {beforeLabel}
            </figcaption>
          </figure>
          <figure className={`relative overflow-hidden rounded-[12px] border border-border bg-brand-navy ${aspectClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={afterSrc} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover" />
            <figcaption className="absolute bottom-0 left-0 right-0 bg-brand-navy/70 px-12 py-8 text-[12px] uppercase tracking-[0.05em] text-text-inverse backdrop-blur-sm">
              {afterLabel}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
