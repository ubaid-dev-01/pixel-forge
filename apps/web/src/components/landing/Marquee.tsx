const ITEMS = [
  "RESTORE",
  "UPSCALE",
  "DENOISE",
  "SHARPEN",
  "FACE REPAIR",
  "BACKGROUND",
  "VIDEO ENHANCE",
  "HONEST LABELS",
];

function WeldDot() {
  return (
    <svg
      aria-hidden
      className="mx-28 inline-block align-middle"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <rect x="1" y="1" width="6" height="12" rx="1.2" fill="currentColor" opacity="0.9" />
      <rect x="8.5" y="1" width="4.5" height="5" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="8.5" y="7.5" width="4.5" height="5.5" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="6.5" y="6" width="3" height="1.5" rx="0.4" fill="#A8D4E4" />
    </svg>
  );
}

export function Marquee({ inverted = false }: { inverted?: boolean }) {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      className={`overflow-hidden border-y ${
        inverted
          ? "border-white/10 bg-brand-navy text-text-inverse"
          : "border-white/10 bg-brand-navy text-text-inverse"
      }`}
      aria-hidden
    >
      <div className="pf-marquee flex w-max items-center py-16 whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center font-display text-[12px] font-semibold tracking-[0.22em] text-text-inverse/90 uppercase"
          >
            {item}
            <WeldDot />
          </span>
        ))}
      </div>
    </div>
  );
}
