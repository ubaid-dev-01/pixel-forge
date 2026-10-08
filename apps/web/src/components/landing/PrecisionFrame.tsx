import type { ReactNode } from "react";

/** Corner reconstruction ticks — logo-language framing without decorative clutter. */
export function PrecisionFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <span aria-hidden className="pf-corner pf-corner-tl" />
      <span aria-hidden className="pf-corner pf-corner-tr" />
      <span aria-hidden className="pf-corner pf-corner-bl" />
      <span aria-hidden className="pf-corner pf-corner-br" />
      {children}
      {label ? (
        <span className="absolute right-16 bottom-16 z-10 font-mono text-[10px] tracking-[0.16em] text-text-inverse/80 uppercase">
          {label}
        </span>
      ) : null}
    </div>
  );
}
