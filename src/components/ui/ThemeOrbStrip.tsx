"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { THEME_LIST, type ThemeId } from "@/lib/themes";

interface ThemeOrbStripProps {
  className?: string;
  compact?: boolean;
}

export function ThemeOrbStrip({
  className = "",
  compact = false,
}: ThemeOrbStripProps) {
  const { themeId, setThemeId } = useTheme();

  return (
    <div
      className={`flex items-center justify-center ${compact ? "gap-2.5" : "gap-5"} ${className}`}
      role="group"
      aria-label="意识色调"
    >
      {THEME_LIST.map((t) => {
        const active = themeId === t.id;
        const size = compact ? 28 : 36;

        return (
          <button
            key={t.id}
            type="button"
            aria-label={t.name}
            aria-pressed={active}
            onClick={() => setThemeId(t.id as ThemeId)}
            className="group flex flex-col items-center gap-2"
          >
            <motion.span
              className="relative block rounded-full"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 38% 32%, ${t.colors.accent}66 0%, ${t.colors.mystic} 48%, ${t.colors.void} 100%)`,
                boxShadow: active
                  ? `0 0 0 2px ${t.colors.accent}, 0 0 28px ${t.colors.glowPrimary}, inset 0 0 12px ${t.colors.accent}33`
                  : `0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.5)`,
              }}
              whileTap={{ scale: 0.94 }}
              animate={active ? { scale: 1.06 } : { scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="absolute inset-[33%] rounded-full"
                style={{
                  background: t.colors.accent,
                  boxShadow: `0 0 10px ${t.colors.accent}`,
                  opacity: active ? 1 : 0.75,
                }}
              />
            </motion.span>
            {!compact && (
              <span
                className={`text-[8px] tracking-[0.14em] uppercase ${
                  active ? "text-accent" : "text-muted/75"
                }`}
              >
                {t.name.split(" ")[0]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
