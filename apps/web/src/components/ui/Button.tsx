import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "rounded-[8px] bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-pressed disabled:bg-surface-3 disabled:text-text-muted",
  secondary:
    "rounded-[8px] bg-transparent text-text border border-border-strong hover:bg-surface-2 active:bg-surface-3 disabled:text-text-muted",
  ghost:
    "rounded-[8px] bg-transparent text-text-muted hover:text-text hover:bg-surface-2 disabled:text-text-muted",
  danger:
    "rounded-[8px] bg-danger text-accent-fg hover:bg-danger-hover disabled:bg-surface-3 disabled:text-text-muted",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  href?: string;
  loading?: boolean;
  selected?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  href,
  loading,
  selected,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex min-h-44 min-w-44 items-center justify-center gap-8 px-16 text-[15px] font-medium tracking-[-0.01em]",
    "transition-[color,background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "disabled:cursor-not-allowed",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variants[variant],
    selected ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : "",
    className ?? "",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || loading} aria-busy={loading || undefined}>
        {loading ? "Working…" : children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={selected}
      {...props}
    >
      {loading ? "Working…" : children}
    </button>
  );
}
