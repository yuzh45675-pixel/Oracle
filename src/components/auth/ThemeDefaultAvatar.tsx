"use client";

import type { ThemeId } from "@/lib/themes";
import { ORACLE_THEMES } from "@/lib/themes";

interface ThemeDefaultAvatarProps {
  themeId: ThemeId;
  size?: number;
  className?: string;
  selected?: boolean;
}

export function ThemeDefaultAvatar({
  themeId,
  size = 40,
  className = "",
  selected = false,
}: ThemeDefaultAvatarProps) {
  const t = ORACLE_THEMES[themeId] ?? ORACLE_THEMES["astral-void"];

  return (
    <span
      aria-hidden
      className={`block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 32%, ${t.colors.accent}55 0%, ${t.colors.mystic} 46%, ${t.colors.void} 100%)`,
        boxShadow: selected
          ? `0 0 0 2px ${t.colors.accent}, 0 0 16px ${t.colors.glowPrimary}`
          : `inset 0 0 0 1px rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.45)`,
      }}
    />
  );
}
