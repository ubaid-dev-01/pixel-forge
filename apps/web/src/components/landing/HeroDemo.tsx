"use client";

import { useCallback, useRef, useState } from "react";
import { SAMPLES } from "@/lib/samples";

/** Full-bleed compare plane for the hero — interactive visual anchor. */
export function HeroDemo() {
  const active = SAMPLES[1] ?? SAMPLES[0];
  const [position, setPosition] = useState(48);
  const dragging = useRef(false);

  const onPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = ((event.clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div
      className="absolute inset-0 cursor-ew-resize overflow-hidden bg-brand-deep"
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
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") setPosition((v) => Math.max(0, v - 2));
        if (event.key === "ArrowRight") setPosition((v) => Math.min(100, v + 2));
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active.after}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active.before}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      {/* Scan atmosphere */}
      <div aria-hidden className="pf-scan pointer-events-none absolute inset-0 mix-blend-soft-light" />

      {/* Edge labels */}
      <span className="pointer-events-none absolute top-112 left-24 z-10 font-mono text-[10px] tracking-[0.2em] text-text-inverse/70 uppercase sm:left-40">
        Original
      </span>
      <span className="pointer-events-none absolute top-112 right-24 z-10 font-mono text-[10px] tracking-[0.2em] text-text-inverse/70 uppercase sm:right-40">
        Restored · sample
      </span>

      {/* Compare rail */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-brand-teal"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <span className="pf-sheen absolute inset-0 rounded-full border border-brand-teal/80 bg-brand-navy/55" />
          <span aria-hidden className="relative h-px w-20 bg-text-inverse/90" />
          <span aria-hidden className="absolute h-20 w-px bg-text-inverse/90" />
        </span>
      </div>
    </div>
  );
}
