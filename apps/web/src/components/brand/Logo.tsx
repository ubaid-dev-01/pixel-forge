type LogoProps = {
  variant?: "full" | "compact" | "mark";
  inverted?: boolean;
  className?: string;
  size?: "md" | "lg";
};

/**
 * PixelForge mark — Modular Reconstruct
 * Forged body + reconstructing modules + precision weld.
 */
function Mark({
  inverted = false,
  size = 40,
}: {
  inverted?: boolean;
  size?: number;
}) {
  const body = inverted ? "#FFD84D" : "#7357D8";
  const moduleFill = inverted ? "#A894F0" : "#5F45C4";
  const weld = inverted ? "#F8F7F2" : "#FFD84D";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        fill={body}
        d="M13 10h14a7 7 0 0 1 7 7v13h-4v4h4v13a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7z"
      />
      <path
        fill={moduleFill}
        d="M43 10h7l6 6v7a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z"
      />
      <rect x="38" y="32" width="18" height="22" rx="5" fill={moduleFill} />
      <rect x="30" y="30" width="8" height="4" rx="1" fill={weld} />
    </svg>
  );
}

export function Logo({ variant = "full", inverted = false, className, size = "lg" }: LogoProps) {
  const word = inverted ? "text-text-inverse" : "text-brand-navy";
  const markSize = size === "lg" ? 40 : 28;
  const textSize =
    variant === "compact"
      ? size === "lg"
        ? "text-[20px]"
        : "text-[15px]"
      : size === "lg"
        ? "text-[24px]"
        : "text-[17px]";
  const tracking = variant === "compact" ? "tracking-[-0.04em]" : "tracking-[-0.03em]";

  return (
    <span className={`inline-flex items-center gap-12 ${className ?? ""}`}>
      <Mark inverted={inverted} size={markSize} />
      {variant !== "mark" ? (
        <span className={`font-display ${textSize} font-semibold ${tracking} ${word}`}>
          PixelForge
        </span>
      ) : null}
    </span>
  );
}
