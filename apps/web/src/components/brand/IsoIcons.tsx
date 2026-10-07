/**
 * Content-specific isometric icons — PixelForge brand palette.
 * Outline #0C1127 · Depth #011F55 · Accent #1E82A2 · Highlight #6EC1E4
 * One distinct mark per tool / section — never reuse by category alone.
 */

type IconProps = { className?: string; title?: string };

const OUT = "#0C1127";
const DEEP = "#011F55";
const TEAL = "#1E82A2";
const LIGHT = "#6EC1E4";
const FACE = "#FFFFFF";
const SIDE = "#E8F0F6";

function Frame({ children, className, title }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {children}
    </svg>
  );
}

/** Photo stack + repair discs */
export function IsoRestore({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M28 62 L52 50 L76 62 L52 74 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M28 56 L52 44 L76 56 L52 68 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M28 50 L52 38 L76 50 L52 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M36 48 L52 40 L68 48 L52 56 Z" fill={LIGHT} opacity="0.35" />
      <ellipse cx="82" cy="58" rx="18" ry="18" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="82" cy="58" rx="12" ry="12" fill="none" stroke={TEAL} strokeWidth="5" />
      <ellipse cx="90" cy="48" rx="14" ry="14" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="90" cy="48" rx="9" ry="9" fill="none" stroke={LIGHT} strokeWidth="4" />
    </Frame>
  );
}

/** Growing resolution bars */
export function IsoUpscale({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M28 72 L40 66 L40 52 L28 58 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M28 58 L40 52 L52 58 L40 64 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M40 52 L52 58 L52 72 L40 66 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M48 72 L60 66 L60 40 L48 46 Z" fill={DEEP} stroke={OUT} strokeWidth="1.5" />
      <path d="M48 46 L60 40 L72 46 L60 52 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M60 40 L72 46 L72 72 L60 66 Z" fill={DEEP} stroke={OUT} strokeWidth="1.5" />
      <path d="M68 72 L80 66 L80 28 L68 34 Z" fill={DEEP} stroke={OUT} strokeWidth="1.5" />
      <path d="M68 34 L80 28 L92 34 L80 40 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" />
      <path d="M80 28 L92 34 L92 72 L80 66 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M34 56 Q50 48 62 44 Q78 36 88 26" stroke={OUT} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="56" r="3.5" fill={FACE} stroke={OUT} strokeWidth="1.2" />
      <circle cx="88" cy="26" r="3" fill={LIGHT} stroke={OUT} strokeWidth="1.2" />
    </Frame>
  );
}

/** Face / portrait bust */
export function IsoFace({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <ellipse cx="60" cy="38" rx="18" ry="20" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M42 58 Q60 72 78 58 L74 78 Q60 88 46 78 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="54" cy="36" rx="2.5" ry="3" fill={DEEP} />
      <ellipse cx="66" cy="36" rx="2.5" ry="3" fill={DEEP} />
      <path d="M54 46 Q60 50 66 46" stroke={TEAL} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="82" cy="28" r="8" fill={LIGHT} stroke={OUT} strokeWidth="1.4" />
      <path d="M79 28 L85 28 M82 25 L82 31" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

/** Peeling layers — background remove */
export function IsoBackground({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M30 70 L60 55 L90 70 L60 85 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M34 58 L64 43 L94 58 L64 73 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M38 46 L68 31 L98 46 L68 61 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M68 31 L98 46 L92 38 L68 26 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" />
      <path d="M48 48 L62 41 L76 48 L62 55 Z" fill={TEAL} opacity="0.85" stroke={OUT} strokeWidth="1.2" />
    </Frame>
  );
}

/** Sparkle wipe — cleanup */
export function IsoCleanup({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M34 68 L58 54 L82 68 L58 82 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M34 52 L58 38 L82 52 L58 66 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M42 50 L70 50" stroke={OUT} strokeWidth="1.4" opacity="0.3" />
      <path d="M44 56 L66 56" stroke={OUT} strokeWidth="1.4" opacity="0.25" />
      <path d="M78 28 L86 36 L78 44 L70 36 Z" fill={TEAL} stroke={OUT} strokeWidth="1.4" />
      <path d="M88 42 L94 48 L88 54 L82 48 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.3" />
      <path d="M70 24 L74 28 L70 32 L66 28 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.2" />
    </Frame>
  );
}

/** Diamond focus — sharpen */
export function IsoSharpen({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M60 16 L88 48 L60 80 L32 48 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M60 16 L88 48 L60 48 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M60 16 L32 48 L60 48 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" />
      <path d="M60 48 L88 48 L60 80 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M60 48 L32 48 L60 80 Z" fill={DEEP} stroke={OUT} strokeWidth="1.5" />
      <circle cx="60" cy="48" r="6" fill={FACE} stroke={OUT} strokeWidth="1.4" />
    </Frame>
  );
}

/** Grain clearing — denoise */
export function IsoDenoise({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M28 62 L60 44 L92 62 L60 80 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M28 48 L60 30 L92 48 L60 66 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      {[
        [40, 48],
        [48, 54],
        [36, 56],
        [44, 42],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill={OUT} opacity="0.35" />
      ))}
      <path d="M58 40 L88 40 L88 58 L58 58 Z" fill={TEAL} opacity="0.25" stroke={TEAL} strokeWidth="1.4" />
      <path d="M72 36 L84 48" stroke={LIGHT} strokeWidth="3" strokeLinecap="round" />
      <path d="M80 36 L80 52 M72 44 L88 44" stroke={OUT} strokeWidth="1.5" strokeLinecap="round" />
    </Frame>
  );
}

/** Color prism / wheel */
export function IsoColor({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M60 22 L86 66 L34 66 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M60 22 L86 66 L60 66 Z" fill={TEAL} stroke={OUT} strokeWidth="1.4" />
      <path d="M60 22 L34 66 L60 66 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.4" />
      <path d="M48 54 L72 54 L60 66 Z" fill={DEEP} stroke={OUT} strokeWidth="1.3" />
      <circle cx="60" cy="48" r="7" fill={FACE} stroke={OUT} strokeWidth="1.4" />
    </Frame>
  );
}

/** Format swap arrows */
export function IsoConvert({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M28 55 L48 43 L48 55 L28 67 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M28 43 L48 31 L48 43 L28 55 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M48 31 L68 43 L48 55 L28 43 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" />
      <path d="M58 48 L78 36 L98 48 L78 60 Z" fill={TEAL} stroke={OUT} strokeWidth="1.6" />
      <path
        d="M72 42 L84 48 L72 54"
        fill="none"
        stroke={FACE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** File squeeze — compress */
export function IsoCompress({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M38 70 L60 58 L82 70 L60 82 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M34 50 L56 38 L78 50 L56 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M42 34 L64 22 L86 34 L64 46 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" opacity="0.7" />
      <path d="M48 40 L48 56 M68 36 L68 52" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 48 L54 48 M62 44 L74 44" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M56 28 L64 22 L72 28" fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M56 66 L64 72 L72 66" fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
    </Frame>
  );
}

/** Film strip — base video */
export function IsoVideo({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M24 58 L50 44 L96 58 L70 72 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M24 48 L50 34 L96 48 L70 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <rect x="36" y="42" width="5" height="5" rx="1" fill={OUT} />
      <rect x="50" y="42" width="5" height="5" rx="1" fill={OUT} />
      <rect x="64" y="42" width="5" height="5" rx="1" fill={OUT} />
      <rect x="78" y="42" width="5" height="5" rx="1" fill={OUT} />
      <path d="M58 42 L74 50 L58 58 Z" fill={TEAL} stroke={OUT} strokeWidth="1.4" />
    </Frame>
  );
}

/** Video + growth bars */
export function IsoVideoUpscale({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M22 60 L42 48 L70 60 L50 72 Z" fill={SIDE} stroke={OUT} strokeWidth="1.4" />
      <path d="M22 50 L42 38 L70 50 L50 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.4" />
      <path d="M48 42 L58 48 L48 54 Z" fill={TEAL} stroke={OUT} strokeWidth="1.2" />
      <path d="M74 72 L82 68 L82 54 L74 58 Z" fill={SIDE} stroke={OUT} strokeWidth="1.3" />
      <path d="M74 58 L82 54 L90 58 L82 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.3" />
      <path d="M82 48 L90 44 L90 30 L82 34 Z" fill={DEEP} stroke={OUT} strokeWidth="1.3" />
      <path d="M82 34 L90 30 L98 34 L90 38 Z" fill={TEAL} stroke={OUT} strokeWidth="1.3" />
      <path d="M90 24 L98 20 L98 8 L90 12 Z" fill={DEEP} stroke={OUT} strokeWidth="1.3" />
      <path d="M90 12 L98 8 L106 12 L98 16 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.3" />
    </Frame>
  );
}

/** Video + noise scrub */
export function IsoVideoDenoise({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M26 60 L52 46 L90 60 L64 74 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M26 48 L52 34 L90 48 L64 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <circle cx="40" cy="48" r="2" fill={OUT} opacity="0.4" />
      <circle cx="48" cy="54" r="2" fill={OUT} opacity="0.35" />
      <circle cx="36" cy="54" r="1.8" fill={OUT} opacity="0.3" />
      <path d="M68 36 L88 48" stroke={LIGHT} strokeWidth="4" strokeLinecap="round" />
      <path d="M78 34 L78 52 M68 44 L88 44" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

/** Video + diamond tip */
export function IsoVideoSharpen({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M24 60 L48 46 L80 60 L56 74 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M24 50 L48 36 L80 50 L56 64 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M86 28 L98 42 L86 56 L74 42 Z" fill={TEAL} stroke={OUT} strokeWidth="1.4" />
      <path d="M86 28 L98 42 L86 42 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.2" />
      <circle cx="86" cy="42" r="3.5" fill={FACE} stroke={OUT} strokeWidth="1.2" />
    </Frame>
  );
}

/** Gyro / level — stabilize */
export function IsoStabilize({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <ellipse cx="60" cy="52" rx="32" ry="18" fill="none" stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="60" cy="52" rx="22" ry="12" fill="none" stroke={LIGHT} strokeWidth="1.5" />
      <path d="M40 48 L60 36 L80 48 L60 60 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M40 48 L60 36 L60 48 Z" fill={TEAL} stroke={OUT} strokeWidth="1.3" />
      <path d="M60 36 L80 48 L60 48 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.3" />
      <circle cx="60" cy="48" r="4" fill={DEEP} stroke={OUT} strokeWidth="1.2" />
      <path d="M60 28 L60 36 M60 60 L60 68" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />
    </Frame>
  );
}

/** Frame fan — interpolate */
export function IsoInterpolate({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M30 68 L48 56 L66 68 L48 80 Z" fill={SIDE} stroke={OUT} strokeWidth="1.4" opacity="0.7" />
      <path d="M40 56 L58 44 L76 56 L58 68 Z" fill={FACE} stroke={OUT} strokeWidth="1.4" />
      <path d="M50 42 L68 30 L86 42 L68 54 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M58 34 L68 28 L78 34" fill="none" stroke={LIGHT} strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="70" r="2.5" fill={OUT} />
      <circle cx="58" cy="58" r="2.5" fill={TEAL} />
      <circle cx="68" cy="42" r="2.5" fill={LIGHT} stroke={OUT} strokeWidth="1" />
    </Frame>
  );
}

/** Film + format badge — video convert */
export function IsoVideoConvert({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M24 58 L46 46 L78 58 L56 70 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M24 48 L46 36 L78 48 L56 60 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M72 40 L92 30 L104 42 L84 52 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M80 38 L96 38" stroke={FACE} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M82 44 L94 44" stroke={LIGHT} strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

/** Film squeeze — video compress */
export function IsoVideoCompress({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M28 64 L52 50 L84 64 L60 78 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M28 52 L52 38 L84 52 L60 66 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M40 34 L50 28 L60 34" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M52 70 L62 76 L72 70" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M44 44 L44 56 M68 44 L68 56" stroke={LIGHT} strokeWidth="2.4" strokeLinecap="round" />
    </Frame>
  );
}

/** Contact sheet — thumbnails */
export function IsoThumbnail({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      {[
        [28, 34],
        [52, 34],
        [76, 34],
        [28, 56],
        [52, 56],
        [76, 56],
      ].map(([x, y], i) => (
        <g key={i}>
          <path
            d={`M${x} ${y + 14} L${x + 14} ${y + 6} L${x + 14} ${y - 2} L${x} ${y + 6} Z`}
            fill={SIDE}
            stroke={OUT}
            strokeWidth="1.2"
          />
          <path
            d={`M${x} ${y + 6} L${x + 14} ${y - 2} L${x + 28} ${y + 6} L${x + 14} ${y + 14} Z`}
            fill={i === 4 ? TEAL : i % 2 === 0 ? FACE : LIGHT}
            stroke={OUT}
            strokeWidth="1.2"
          />
        </g>
      ))}
    </Frame>
  );
}

export function IsoPrivacy({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M60 18 L92 36 L92 68 L60 86 L28 68 L28 36 Z" stroke={LIGHT} strokeWidth="1.8" fill="none" />
      <path d="M60 18 L60 50" stroke={LIGHT} strokeWidth="1.4" opacity="0.55" />
      <path d="M28 36 L60 50 L92 36" stroke={LIGHT} strokeWidth="1.4" opacity="0.55" />
      <path d="M60 50 L60 86" stroke={LIGHT} strokeWidth="1.4" opacity="0.4" />
      <path d="M48 48 L72 48 L72 68 L48 68 Z" fill={TEAL} stroke={OUT} strokeWidth="1.6" />
      <path d="M48 48 L72 48 L68 44 L44 44 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.4" />
      <path d="M72 48 L76 44 L76 64 L72 68 Z" fill={DEEP} stroke={OUT} strokeWidth="1.4" />
      <path
        d="M52 48 V40 C52 34 56 30 60 30 C64 30 68 34 68 40 V48"
        stroke={OUT}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="58" r="3" fill={FACE} />
    </Frame>
  );
}

export function IsoCompare({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M30 62 L60 46 L90 62 L60 78 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M30 42 L60 26 L60 46 L30 62 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M60 26 L90 42 L90 62 L60 46 Z" fill={TEAL} stroke={OUT} strokeWidth="1.6" />
      <line x1="60" y1="26" x2="60" y2="78" stroke={OUT} strokeWidth="2" />
      <circle cx="60" cy="52" r="7" fill={LIGHT} stroke={OUT} strokeWidth="1.6" />
      <circle cx="60" cy="52" r="2.5" fill={FACE} />
    </Frame>
  );
}

export function IsoArchive({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M30 70 L60 54 L90 70 L60 86 Z" fill={SIDE} stroke={OUT} strokeWidth="1.6" />
      <path d="M30 50 L60 34 L60 54 L30 70 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M60 34 L90 50 L90 70 L60 54 Z" fill={TEAL} stroke={OUT} strokeWidth="1.6" />
      <path d="M30 50 L60 34 L90 50 L60 66 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" opacity="0.9" />
      <rect x="52" y="48" width="16" height="8" rx="1" fill={DEEP} stroke={OUT} strokeWidth="1.2" />
    </Frame>
  );
}

export function IsoStudio({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M40 68 L60 56 L80 68 L60 80 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" opacity="0.4" />
      <path d="M45 55 L65 43 L85 55 L65 67 Z" fill="none" stroke={OUT} strokeWidth="1.4" strokeDasharray="3 2" />
      <path d="M40 48 L60 36 L80 48 L60 60 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <path d="M40 48 L40 62 L60 74 L60 60 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M80 48 L80 62 L60 74 L60 60 Z" fill={TEAL} stroke={OUT} strokeWidth="1.5" />
      <path d="M60 36 L80 48 L60 60 L40 48 Z" fill={LIGHT} stroke={OUT} strokeWidth="1.5" />
    </Frame>
  );
}

export function IsoEditorial({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M38 72 L62 58 L86 72 L62 86 Z" fill={SIDE} stroke={OUT} strokeWidth="1.5" />
      <path d="M34 62 L58 48 L82 62 L58 76 Z" fill={FACE} stroke={OUT} strokeWidth="1.5" />
      <path d="M30 52 L54 38 L78 52 L54 66 Z" fill={FACE} stroke={OUT} strokeWidth="1.6" />
      <line x1="40" y1="50" x2="62" y2="50" stroke={TEAL} strokeWidth="2" />
      <line x1="38" y1="55" x2="58" y2="55" stroke={LIGHT} strokeWidth="2" />
      <line x1="42" y1="45" x2="66" y2="45" stroke={OUT} strokeWidth="1.5" opacity="0.35" />
      <path d="M70 36 L82 42 L76 52 L64 46 Z" fill={TEAL} stroke={OUT} strokeWidth="1.4" />
    </Frame>
  );
}

export function IsoWorkflow({ className, title }: IconProps) {
  return (
    <Frame className={className} title={title}>
      {[0, 1, 2].map((i) => {
        const x = 28 + i * 28;
        const y = 44 + (i % 2) * 6;
        const fill = i === 1 ? TEAL : i === 2 ? LIGHT : FACE;
        return (
          <g key={i}>
            <path
              d={`M${x} ${y + 16} L${x + 14} ${y + 8} L${x + 14} ${y - 4} L${x} ${y + 4} Z`}
              fill={SIDE}
              stroke={OUT}
              strokeWidth="1.4"
            />
            <path
              d={`M${x} ${y + 4} L${x + 14} ${y - 4} L${x + 28} ${y + 4} L${x + 14} ${y + 12} Z`}
              fill={fill}
              stroke={OUT}
              strokeWidth="1.4"
            />
            <path
              d={`M${x + 14} ${y - 4} L${x + 28} ${y + 4} L${x + 28} ${y + 16} L${x + 14} ${y + 8} Z`}
              fill={DEEP}
              stroke={OUT}
              strokeWidth="1.4"
            />
            {i < 2 ? (
              <path d={`M${x + 28} ${y + 6} L${x + 36} ${y + 4}`} stroke={OUT} strokeWidth="1.6" strokeLinecap="round" />
            ) : null}
          </g>
        );
      })}
    </Frame>
  );
}

export const ISO_ICONS = {
  restore: IsoRestore,
  upscale: IsoUpscale,
  face: IsoFace,
  background: IsoBackground,
  cleanup: IsoCleanup,
  sharpen: IsoSharpen,
  denoise: IsoDenoise,
  color: IsoColor,
  convert: IsoConvert,
  compress: IsoCompress,
  video: IsoVideo,
  "video-upscale": IsoVideoUpscale,
  "video-denoise": IsoVideoDenoise,
  "video-sharpen": IsoVideoSharpen,
  "video-stabilize": IsoStabilize,
  "video-interpolate": IsoInterpolate,
  "video-convert": IsoVideoConvert,
  "video-compress": IsoVideoCompress,
  "video-thumbnail": IsoThumbnail,
  privacy: IsoPrivacy,
  compare: IsoCompare,
  archive: IsoArchive,
  studio: IsoStudio,
  editorial: IsoEditorial,
  workflow: IsoWorkflow,
} as const;

export type IsoIconName = keyof typeof ISO_ICONS;

export function IsoIcon({
  name,
  className = "h-64 w-80",
  title,
}: {
  name: IsoIconName;
  className?: string;
  title?: string;
}) {
  const Comp = ISO_ICONS[name];
  return <Comp className={className} title={title} />;
}

/** Map tool slug → unique icon (content-specific, not category). */
export function toolIcon(slug: string): IsoIconName {
  if (slug in ISO_ICONS) return slug as IsoIconName;
  const map: Record<string, IsoIconName> = {
    upscale: "upscale",
    restore: "restore",
    face: "face",
    background: "background",
    cleanup: "cleanup",
    sharpen: "sharpen",
    denoise: "denoise",
    color: "color",
    convert: "convert",
    compress: "compress",
    "video-upscale": "video-upscale",
    "video-denoise": "video-denoise",
    "video-sharpen": "video-sharpen",
    "video-stabilize": "video-stabilize",
    "video-interpolate": "video-interpolate",
    "video-convert": "video-convert",
    "video-compress": "video-compress",
    "video-thumbnail": "video-thumbnail",
  };
  return map[slug] ?? "compare";
}

/** @deprecated Use toolIcon(slug) — category mapping made every card look identical. */
export function categoryIcon(category: string): IsoIconName {
  switch (category) {
    case "enhance":
      return "upscale";
    case "restore":
      return "restore";
    case "cleanup":
      return "cleanup";
    case "convert":
      return "convert";
    case "video":
      return "video";
    default:
      return "compare";
  }
}
