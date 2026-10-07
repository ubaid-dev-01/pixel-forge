type LogoProps = {
  variant?: "full" | "mark";
  inverted?: boolean;
  className?: string;
  size?: "md" | "lg";
};

/** Brand mark: faceted P + pixel cluster from PixelForge identity guide. */
function Mark({
  inverted = false,
  size = 40,
}: {
  inverted?: boolean;
  size?: number;
}) {
  const navy = inverted ? "#6EC1E4" : "#011F55";
  const mid = "#1E82A2";
  const light = "#6EC1E4";
  const cut = inverted ? "#0C1127" : "#F7F9FC";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="6" width="8" height="8" rx="1" fill={light} />
      <rect x="16" y="6" width="8" height="8" rx="1" fill={mid} />
      <rect x="6" y="16" width="8" height="8" rx="1" fill={mid} />
      <path d="M18 14h16c10 0 18 7.5 18 17.5S44 49 34 49H18V14Z" fill={navy} />
      <path d="M34 18c7.2 0 13 5.4 13 13.5S41.2 45 34 45h-6V18h6Z" fill={mid} />
      <path d="M34 22c4.8 0 8.5 3.6 8.5 9.5S38.8 41 34 41h-2V22h2Z" fill={light} />
      <path d="M26 26h6c2.8 0 5 2.2 5 5.5S34.8 37 32 37h-6V26Z" fill={cut} />
      <rect x="18" y="14" width="8" height="40" fill={mid} />
      <rect x="18" y="14" width="4" height="40" fill={light} opacity="0.55" />
    </svg>
  );
}

export function Logo({ variant = "full", inverted = false, className, size = "lg" }: LogoProps) {
  const word = inverted ? "text-text-inverse" : "text-brand-navy";
  const markSize = size === "lg" ? 48 : 34;
  const textSize = size === "lg" ? "text-[26px]" : "text-[19px]";

  return (
    <span className={`inline-flex items-center gap-16 ${className ?? ""}`}>
      <Mark inverted={inverted} size={markSize} />
      {variant === "full" ? (
        <span className={`font-display ${textSize} font-semibold tracking-[-0.03em] ${word}`}>
          PixelForge
        </span>
      ) : null}
    </span>
  );
}
