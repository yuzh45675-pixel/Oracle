"use client";

import { useTheme } from "@/context/ThemeContext";

/** 四套主题共用 Astral Void 级卡背结构，仅 accent / 光晕色相随主题变化 */
export function ThemedCardBack({ reversed }: { reversed?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl"
      style={{ transform: reversed ? "rotate(180deg)" : undefined }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-mystic via-surface to-void" />

      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 28%, ${c.glowPrimary} 0%, transparent 52%),
            radial-gradient(circle at 72% 72%, ${c.glowSecondary} 0%, transparent 48%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
        }}
      />

      <div className="absolute inset-3 rounded-lg border border-white/[0.1]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute h-20 w-20 rounded-full opacity-55 blur-xl"
          style={{ background: c.glowPrimary }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-accent/35 bg-accent/[0.08] shadow-[0_0_28px_var(--glow-primary)] backdrop-blur-sm">
          <div className="absolute h-8 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent" />
          <div className="absolute h-px w-8 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        </div>
      </div>
    </div>
  );
}
