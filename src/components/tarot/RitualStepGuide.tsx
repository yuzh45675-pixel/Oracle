"use client";

interface RitualStepGuideProps {
  step: number;
  total: number;
  title: string;
  hint?: string;
  className?: string;
}

/** 手机端仪式步骤引导（桌面隐藏，避免重复） */
export function RitualStepGuide({
  step,
  total,
  title,
  hint,
  className = "",
}: RitualStepGuideProps) {
  return (
    <div
      className={`mb-5 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-center md:hidden ${className}`}
    >
      <p className="text-[10px] tracking-[0.28em] text-accent uppercase">
        步骤 {step} / {total}
      </p>
      <p className="mt-1.5 text-sm font-medium leading-snug text-frost">{title}</p>
      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
      )}
    </div>
  );
}
