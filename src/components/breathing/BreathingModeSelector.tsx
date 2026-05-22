"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { SystemMistCloud } from "@/components/hero/SystemMistCloud";
import {
  BREATHING_MODES,
  type BreathingModeId,
} from "@/lib/breathing-modes";

const ease = [0.16, 1, 0.3, 1] as const;
const INACTIVE_OPACITY = 0.38;
const INACTIVE_HOVER_OPACITY = 0.82;

type VisualMode = "idle-selected" | "idle-unselected" | "touch-selected" | "active";

function visualMode(
  selected: boolean,
  isActive: boolean,
  isTouch: boolean,
): VisualMode {
  if (isActive) return "active";
  if (isTouch && selected) return "touch-selected";
  if (selected) return "idle-selected";
  return "idle-unselected";
}

interface BreathingModeSelectorProps {
  value: BreathingModeId;
  onChange: (id: BreathingModeId) => void;
  excludeId?: BreathingModeId;
  disabled?: boolean;
  label?: string;
}

export function BreathingModeSelector({
  value,
  onChange,
  excludeId,
  disabled = false,
  label = "呼吸模式",
}: BreathingModeSelectorProps) {
  const isTouch = useIsTouchDevice();
  const { setFocusFromElement } = useParticleInteraction();
  const [hovered, setHovered] = useState<BreathingModeId | null>(null);
  const [pressed, setPressed] = useState<BreathingModeId | null>(null);
  const refs = useRef<Partial<Record<BreathingModeId, HTMLButtonElement | null>>>({});

  const modes = BREATHING_MODES.filter((m) => m.id !== excludeId);

  useEffect(() => {
    return () => setFocusFromElement(null);
  }, [setFocusFromElement]);

  useEffect(() => {
    if (!isTouch || disabled) return;
    setFocusFromElement(refs.current[value] ?? null);
  }, [value, isTouch, disabled, setFocusFromElement]);

  const handleEnter = useCallback(
    (id: BreathingModeId) => {
      if (disabled) return;
      setHovered(id);
      setFocusFromElement(refs.current[id] ?? null);
    },
    [disabled, setFocusFromElement],
  );

  const handleLeave = useCallback(() => {
    setHovered(null);
    if (isTouch) {
      setFocusFromElement(refs.current[value] ?? null);
    } else {
      setFocusFromElement(null);
    }
  }, [isTouch, setFocusFromElement, value]);

  const handleSelect = useCallback(
    (id: BreathingModeId) => {
      onChange(id);
      if (isTouch) {
        requestAnimationFrame(() => {
          setFocusFromElement(refs.current[id] ?? null);
        });
      }
    },
    [isTouch, onChange, setFocusFromElement],
  );

  const activeMode = BREATHING_MODES.find((m) => m.id === value);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-[10px] tracking-[0.35em] text-muted/80 uppercase">
        {label}
      </p>

      <div className="-mx-1 flex w-full items-stretch justify-start gap-2.5 overflow-x-auto px-1 pb-1 snap-x snap-mandatory [scrollbar-width:none] sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {modes.map((mode) => {
          const selected = value === mode.id;
          const isActive =
            pressed === mode.id || (!isTouch && hovered === mode.id);
          const vMode = visualMode(selected, isActive, isTouch);
          const dimmed = vMode === "idle-unselected";

          const scale =
            vMode === "active" ? 1.1 : vMode === "touch-selected" ? 1.04 : 1;
          const opacity =
            vMode === "idle-unselected"
              ? INACTIVE_OPACITY
              : vMode === "active" && !selected
                ? INACTIVE_HOVER_OPACITY
                : 1;
          const showMist = vMode === "active";

          return (
            <motion.button
              key={mode.id}
              ref={(el) => {
                refs.current[mode.id] = el;
              }}
              type="button"
              disabled={disabled}
              data-particle-pass
              onClick={() => handleSelect(mode.id)}
              onMouseEnter={() => !isTouch && handleEnter(mode.id)}
              onMouseLeave={() => !isTouch && handleLeave()}
              onFocus={() => handleEnter(mode.id)}
              onBlur={() => !isTouch && handleLeave()}
              onTouchStart={() => {
                if (disabled) return;
                setPressed(mode.id);
                setFocusFromElement(refs.current[mode.id] ?? null);
              }}
              onTouchEnd={() => setPressed(null)}
              onTouchCancel={() => setPressed(null)}
              initial={false}
              className={`relative flex min-w-[6.75rem] shrink-0 snap-center flex-col items-center overflow-visible rounded-2xl border px-2.5 py-3.5 text-center touch-manipulation sm:min-w-[7.25rem] ${
                selected
                  ? "border-accent/30 bg-accent/[0.08]"
                  : "border-white/[0.08] bg-white/[0.02]"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
              animate={{
                scale,
                y: vMode === "active" ? -4 : 0,
                opacity,
              }}
              transition={{ duration: 0.55, ease }}
              whileTap={{ scale: vMode === "active" ? 1.06 : 0.97 }}
            >
              <SystemMistCloud active={showMist && !disabled} />

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow:
                    vMode === "active"
                      ? "0 0 40px color-mix(in srgb, var(--accent) 28%, transparent)"
                      : vMode === "touch-selected"
                        ? "0 0 28px color-mix(in srgb, var(--accent) 16%, transparent)"
                        : selected
                          ? "0 0 24px color-mix(in srgb, var(--accent) 12%, transparent)"
                          : "0 0 0 transparent",
                }}
                transition={{ duration: 0.55, ease }}
              />

              <div className="relative z-10 mb-2 flex h-10 w-10 items-center justify-center">
                <motion.span
                  className="block h-2 w-2 rounded-full bg-accent/80"
                  animate={{
                    scale: showMist ? [1, 1.35, 1] : selected ? 1.15 : 1,
                    opacity: dimmed ? 0.45 : 1,
                  }}
                  transition={{
                    duration: showMist ? 2.4 : 0.4,
                    repeat: showMist ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <span
                className={`relative z-10 text-[10px] leading-tight tracking-wide ${
                  dimmed ? "text-muted/70" : "text-frost"
                }`}
              >
                {mode.name}
              </span>
              <span className="relative z-10 mt-1 text-[8px] tracking-wide text-muted/65">
                {mode.rhythm}
              </span>
            </motion.button>
          );
        })}
      </div>

      {isTouch && !excludeId && (
        <p className="text-[9px] tracking-[0.2em] text-muted/60 uppercase">
          轻触选择 · 按住卡片见云雾
        </p>
      )}

      {!excludeId && activeMode && (
        <AnimatePresence mode="wait">
          <motion.p
            key={value}
            className="max-w-sm text-xs leading-relaxed text-muted/90"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}
          >
            {activeMode.subtitle}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}
