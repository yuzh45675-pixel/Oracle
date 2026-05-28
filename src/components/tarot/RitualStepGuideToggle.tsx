"use client";

interface RitualStepGuideToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

/** 手机端：是否显示新手步骤引导 */
export function RitualStepGuideToggle({
  enabled,
  onChange,
  className = "",
}: RitualStepGuideToggleProps) {
  return (
    <div
      className={`mb-3 flex justify-center md:hidden ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] tracking-wide text-muted transition hover:border-accent/25 hover:text-frost"
      >
        <span>新手步骤引导</span>
        <span
          className={`rounded-full px-2 py-0.5 font-medium transition ${
            enabled
              ? "bg-accent/20 text-accent"
              : "bg-white/[0.06] text-muted/80"
          }`}
        >
          {enabled ? "开" : "关"}
        </span>
      </button>
    </div>
  );
}
