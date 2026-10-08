const STEPS = [
  {
    n: "01",
    title: "Upload",
    body: "Signed URLs into private storage. Your files never sit on the web request path.",
  },
  {
    n: "02",
    title: "Process",
    body: "Classical OpenCV/Pillow pipelines or licensed models — named, never silent swaps.",
  },
  {
    n: "03",
    title: "Compare",
    body: "Every finished job opens against the original. Slider, side-by-side, then download.",
  },
];

export function ProcessSteps() {
  return (
    <ol className="grid gap-0 md:grid-cols-3">
      {STEPS.map((step, i) => (
        <li
          key={step.n}
          className={`relative px-0 py-28 md:px-28 md:py-0 ${
            i < STEPS.length - 1 ? "md:border-r md:border-border" : ""
          } ${i > 0 ? "border-t border-border md:border-t-0" : ""}`}
        >
          <div className="flex items-center gap-12">
            <span className="inline-flex h-28 w-28 items-center justify-center border border-brand-deep/20 bg-brand-deep/[0.04] font-mono text-[11px] font-semibold tracking-[0.08em] text-brand-deep">
              {step.n}
            </span>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-brand-teal/50 to-transparent" />
          </div>
          <h3 className="font-display mt-20 text-[1.35rem] font-semibold tracking-[-0.02em] text-brand-navy">
            {step.title}
          </h3>
          <p className="mt-10 max-w-[32ch] text-[0.95rem] leading-[1.65] text-text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
