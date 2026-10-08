"use client";

import { SAMPLES } from "@/lib/samples";

/** Overlapping sample frames — refined archive stack. */
export function PolaroidStack() {
  const cards = [SAMPLES[1], SAMPLES[0], SAMPLES[2]].filter(Boolean);

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[540px] sm:h-[500px]">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(30_130_162/14%),transparent_68%)]"
      />

      {cards.map((sample, index) => {
        const rotates = [-6, 2, 8] as const;
        const offsets = [
          "left-[6%] top-[12%] z-[1]",
          "left-[24%] top-[22%] z-[2]",
          "left-[40%] top-[8%] z-[3]",
        ];
        return (
          <figure
            key={sample.id}
            className={`group absolute w-[56%] max-w-[250px] border border-border bg-bg-elevated p-8 shadow-[0_20px_48px_rgb(12_17_39/12%)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:!rotate-0 hover:scale-[1.03] hover:shadow-[0_28px_56px_rgb(12_17_39/18%)] sm:max-w-[270px] ${offsets[index]}`}
            style={{ transform: `rotate(${rotates[index]}deg)` }}
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sample.after}
                alt=""
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute top-10 left-10 h-10 w-10 border-t border-l border-text-inverse/70" />
              <span className="absolute right-10 bottom-10 h-10 w-10 border-r border-b border-text-inverse/70" />
            </div>
            <figcaption className="mt-12 px-4 pb-6">
              <span className="font-display text-[13px] font-semibold tracking-[-0.01em] text-brand-navy">
                {sample.title}
              </span>
              <span className="mt-4 block font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
                {sample.label}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
