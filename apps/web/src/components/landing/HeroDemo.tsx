"use client";

import { useCallback, useRef, useState } from "react";
import { SAMPLES } from "@/lib/samples";

/** Edge-to-edge compare plane — images always cover the frame. */
export function HeroDemo() {
  const [active, setActive] = useState<(typeof SAMPLES)[number]>(SAMPLES[1] ?? SAMPLES[0]);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const onPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = ((event.clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  return (
    <div className="relative h-full min-h-[520px] w-full">
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
        aria-label="Comparison position"
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
          alt="Enhanced"
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.before}
          alt="Original"
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-text-inverse"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-text-inverse bg-brand-navy/75 text-[13px] text-text-inverse shadow-soft backdrop-blur-sm">
            ⟷
          </span>
        </div>
        <span className="pointer-events-none absolute top-20 left-20 rounded-[6px] bg-brand-navy/70 px-12 py-6 text-[11px] font-medium uppercase tracking-[0.08em] text-text-inverse backdrop-blur-sm">
          Original
        </span>
        <span className="pointer-events-none absolute top-20 right-20 rounded-[6px] bg-brand-navy/70 px-12 py-6 text-[11px] font-medium uppercase tracking-[0.08em] text-text-inverse backdrop-blur-sm">
          Enhanced
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent px-20 pb-24 pt-96">
        <div className="pointer-events-auto flex flex-wrap gap-8">
          {SAMPLES.slice(0, 5).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => setActive(sample)}
              className={`min-h-40 rounded-[8px] px-14 text-[12px] font-medium uppercase tracking-[0.06em] transition-colors duration-[150ms] ${
                active.id === sample.id
                  ? "bg-brand-light text-brand-navy"
                  : "bg-white/12 text-text-inverse backdrop-blur-sm hover:bg-white/22"
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>
        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.1em] text-brand-light">
          {active.label} · drag to compare
        </p>
      </div>
    </div>
  );
}
