import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClass =
  "min-h-44 w-full border border-border bg-surface px-12 text-text placeholder:text-text-subtle hover:border-border-strong focus:border-accent disabled:opacity-50";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-8">
      <span className="text-[12px] uppercase tracking-[0.16em] text-text-muted">{label}</span>
      {children}
      {error ? (
        <span className="text-[14px] text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[14px] text-text-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldClass} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} min-h-[120px] py-12`} {...props} />;
}
