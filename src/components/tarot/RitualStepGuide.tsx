"use client";

interface RitualStepGuideProps {
  step: number;
  total: number;
  title: string;
  hint?: string;
  className?: string;
}

/** 手机端仪式步骤引导（桌面隐藏，需用户主动开启） */
export function RitualStepGuide({
  step,
  total,
  title,
  hint,
  className = "",
}: RitualStepGuideProps) {
  return (
    <div
      className={`mb-3 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2 text-center md:hidden ${className}`}
    >
      <p className="text-[9px] tracking-[0.22em] text-accent/90 uppercase">
        步骤 {step}/{total}
      </p>
      <p className="mt-1 text-xs font-medium leading-snug text-frost/95">
        {title}
      </p>
      {hint && (
        <p className="mt-1 text-[10px] leading-relaxed text-muted/90">{hint}</p>
      )}
    </div>
  );
}
