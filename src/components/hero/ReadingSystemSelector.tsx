"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { SystemEmblem } from "./SystemEmblem";
import { SystemMistCloud } from "./SystemMistCloud";

export type ReadingSystemChoice = "tarot" | "lenormand";

const SYSTEMS: {
  id: ReadingSystemChoice;
  en: string;
  cn: string;
  hint: string;
}[] = [
  {
    id: "tarot",
    en: "Tarot",
    cn: "塔罗",
    hint: "心理象征、正逆位、经典塔罗牌阵。",
  },
  {
    id: "lenormand",
    en: "Lenormand",
    cn: "雷诺曼",
    hint: "现实事件、符号组合、无逆位，以牌际关系推演。",
  },
];

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

interface ReadingSystemSelectorProps {
  value: ReadingSystemChoice;
  onChange: (value: ReadingSystemChoice) => void;
  disabled?: boolean;
}

export function ReadingSystemSelector({
  value,
  onChange,
  disabled = false,
}: ReadingSystemSelectorProps) {
  const isTouch = useIsTouchDevice();
  const { setFocusFromElement } = useParticleInteraction();
  const [hovered, setHovered] = useState<ReadingSystemChoice | null>(null);
  const [pressed, setPressed] = useState<ReadingSystemChoice | null>(null);
  const refs = useRef<Record<ReadingSystemChoice, HTMLButtonElement | null>>({
    tarot: null,
    lenormand: null,
  });

  useEffect(() => {
    return () => setFocusFromElement(null);
  }, [setFocusFromElement]);

  /** 手机：选中项持续吸引粒子 */
  useEffect(() => {
    if (!isTouch || disabled) return;
    setFocusFromElement(refs.current[value]);
  }, [value, isTouch, disabled, setFocusFromElement]);

  const handleEnter = useCallback(
    (id: ReadingSystemChoice) => {
      if (disabled) return;
      setHovered(id);
      setFocusFromElement(refs.current[id]);
    },
    [disabled, setFocusFromElement],
  );

  const handleLeave = useCallback(() => {
    setHovered(null);
    if (isTouch) {
      setFocusFromElement(refs.current[value]);
    } else {
      setFocusFromElement(null);
    }
  }, [isTouch, setFocusFromElement, value]);

  const handleSelect = useCallback(
    (id: ReadingSystemChoice) => {
      onChange(id);
      if (isTouch) {
        requestAnimationFrame(() => {
          setFocusFromElement(refs.current[id]);
        });
      }
    },
    [isTouch, onChange, setFocusFromElement],
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-[10px] tracking-[0.35em] text-muted/80 uppercase">
        解读体系
      </p>

      <div className="flex items-stretch justify-center gap-3">
        {SYSTEMS.map((sys) => {
          const selected = value === sys.id;
          const isActive =
            pressed === sys.id || (!isTouch && hovered === sys.id);
          const mode = visualMode(selected, isActive, isTouch);
          const dimmed = mode === "idle-unselected";

          const scale =
            mode === "active" ? 1.12 : mode === "touch-selected" ? 1.05 : 1;
          const opacity =
            mode === "idle-unselected"
              ? INACTIVE_OPACITY
              : mode === "active" && !selected
                ? INACTIVE_HOVER_OPACITY
                : 1;
          const showMist = mode === "active";
          const showEmblemHover = mode === "active";

          return (
            <motion.button
              key={sys.id}
              ref={(el) => {
                refs.current[sys.id] = el;
              }}
              type="button"
              disabled={disabled}
              data-particle-pass
              onClick={() => handleSelect(sys.id)}
              onMouseEnter={() => !isTouch && handleEnter(sys.id)}
              onMouseLeave={() => !isTouch && handleLeave()}
              onFocus={() => handleEnter(sys.id)}
              onBlur={() => !isTouch && handleLeave()}
              onTouchStart={() => {
                if (disabled) return;
                setPressed(sys.id);
                setFocusFromElement(refs.current[sys.id]);
              }}
              onTouchEnd={() => setPressed(null)}
              onTouchCancel={() => setPressed(null)}
              initial={false}
              className={`relative flex w-[7.5rem] flex-col items-center overflow-visible rounded-2xl border px-3 py-4 text-center touch-manipulation md:w-[8.5rem] ${
                selected
                  ? "border-accent/30 bg-accent/[0.08]"
                  : "border-white/[0.08] bg-white/[0.02]"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
              animate={{
                scale,
                y: mode === "active" ? -4 : 0,
                opacity,
              }}
              transition={{ duration: 0.55, ease }}
              whileTap={{ scale: mode === "active" ? 1.08 : 0.97 }}
            >
              <SystemMistCloud active={showMist && !disabled} />

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow:
                    mode === "active"
                      ? "0 0 40px color-mix(in srgb, var(--accent) 28%, transparent)"
                      : mode === "touch-selected"
                        ? "0 0 28px color-mix(in srgb, var(--accent) 16%, transparent)"
                        : selected
                          ? "0 0 24px color-mix(in srgb, var(--accent) 12%, transparent)"
                          : "0 0 0 transparent",
                }}
                transition={{ duration: 0.55, ease }}
              />

              <div className="relative z-10 mb-3 h-12 w-12">
                <SystemEmblem system={sys.id} hovered={showEmblemHover} />
              </div>

              <span className="relative z-10 text-[9px] tracking-[0.28em] uppercase text-muted/80">
                {sys.en}
              </span>
              <span
                className={`relative z-10 mt-1 font-display text-sm tracking-wide ${
                  dimmed ? "text-muted/70" : "text-frost"
                }`}
              >
                {sys.cn}
              </span>
            </motion.button>
          );
        })}
      </div>

      {isTouch && (
        <p className="text-[9px] tracking-[0.2em] text-muted/60 uppercase">
          轻触选择 · 按住卡片见云雾
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          className="max-w-sm text-xs leading-relaxed text-muted/90"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease }}
        >
          {SYSTEMS.find((s) => s.id === value)?.hint}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
