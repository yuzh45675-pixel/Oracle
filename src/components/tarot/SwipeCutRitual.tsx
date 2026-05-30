"use client";

import { useCallback, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { TarotCard } from "./TarotCard";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { useTheme } from "@/context/ThemeContext";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { cutGroupCount } from "@/lib/particle-formations";

interface SwipeCutRitualProps {
  /** Cards in spread — drives pile count (3→24, 6→12) */
  spreadCardCount: number;
  onCutComplete: (pileIndex: number) => void;
}

export function SwipeCutRitual({
  spreadCardCount,
  onCutComplete,
}: SwipeCutRitualProps) {
  const { theme } = useTheme();
  const { triggerBurst } = useParticleInteraction();
  const [phase, setPhase] = useState<"stream" | "cutting" | "done">("stream");
  const [selectedPile, setSelectedPile] = useState<number | null>(null);

  const isTouch = useIsTouchDevice();
  const streamCount = isTouch ? 8 : 14;
  const cardSize = isTouch ? "xs" : "sm";
  const groupCount = cutGroupCount(spreadCardCount);
  const streamCenter = (streamCount - 1) / 2;
  const streamX = useMotionValue(0);
  const cutProgress = useMotionValue(0);
  const streamSkew = useTransform(streamX, [-120, 120], [-6, 6]);

  const finishCut = useCallback(
    (pileIndex: number) => {
      if (phase !== "stream") return;
      setPhase("cutting");
      setSelectedPile(pileIndex);
      triggerBurst();
      if (navigator.vibrate) navigator.vibrate([8, 24, 12]);

      animate(cutProgress, 1, { duration: 0.55, ease: [0.16, 1, 0.3, 1] });

      window.setTimeout(() => {
        setPhase("done");
        onCutComplete(pileIndex % 3);
      }, 850);
    },
    [phase, cutProgress, onCutComplete, triggerBurst],
  );

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (phase !== "stream") return;
    const isCut =
      info.velocity.y > 420 ||
      info.offset.y > 90 ||
      (Math.abs(info.velocity.x) > 500 && Math.abs(info.offset.x) > 60);

    if (!isCut) return;

    const third = window.innerWidth / 3;
    const x = info.point.x;
    const pile =
      x < third ? 0 : x < third * 2 ? 1 : 2;
    finishCut(pile);
  };

  return (
    <div className="relative mx-auto w-full max-w-lg touch-pan-y select-none lg:max-w-2xl">
      <p className="mb-6 text-center text-xs leading-relaxed text-muted lg:mb-8 lg:text-sm">
        银河牌流在指间流动
        <br />
        <span className="text-frost/80">横向拨动 · 或向下划开命运</span>
      </p>

      <motion.div
        className="relative h-[280px] overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-md md:h-[340px] lg:h-[380px]"
        style={{
          boxShadow: `inset 0 1px 0 ${theme.colors.border}`,
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{ x: streamX, skewY: streamSkew }}
          drag={phase === "stream" ? "x" : false}
          dragConstraints={{ left: -160, right: 160 }}
          dragElastic={0.08}
          onPanEnd={onPanEnd}
          onPan={(_, info) => {
            if (phase !== "stream") return;
            if (info.offset.y > 70) {
              const pile = info.point.x < window.innerWidth / 3 ? 0 : info.point.x < (window.innerWidth * 2) / 3 ? 1 : 2;
              finishCut(pile);
            }
          }}
        >
          {Array.from({ length: streamCount }).map((_, i) => (
            <motion.div
              key={i}
              className="relative shrink-0"
              style={{
                marginLeft: i === 0 ? 0 : isTouch ? -36 : -48,
                zIndex: i,
                rotate: (i - streamCenter) * 2.2,
              }}
              animate={
                phase === "stream"
                  ? { y: [0, -4 - (i % 3), 0] }
                  : selectedPile !== null && i % 3 === selectedPile
                    ? { y: -48, scale: 1.04 }
                    : { y: 40, opacity: 0.2, scale: 0.9 }
              }
              transition={{
                y: { duration: 3 + (i % 5) * 0.2, repeat: phase === "stream" ? Infinity : 0, ease: "easeInOut" },
                default: { duration: 0.5 },
              }}
            >
              <TarotCard
                size={cardSize}
                interactive={false}
                instant
                backDetail="static"
              />
            </motion.div>
          ))}
        </motion.div>

        {phase === "cutting" && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute left-0 right-0 top-1/2 h-px origin-center"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.colors.accentSoft}, transparent)`,
                opacity: 0.6,
              }}
              initial={{ scaleX: 0, rotate: -8 }}
              animate={{ scaleX: 1, rotate: 0 }}
              transition={{ duration: 0.45 }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.colors.glowPrimary}, transparent 72%)`,
              }}
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </motion.div>
        )}
      </motion.div>

      <p className="mt-4 text-center text-[10px] tracking-[0.2em] text-muted/70 uppercase">
        {groupCount} 组命运切片 · 选堆 {selectedPile !== null ? selectedPile + 1 : "—"}
      </p>

      <div className="mt-5 flex justify-center gap-2">
        {[0, 1, 2].map((pile) => (
          <button
            key={pile}
            type="button"
            disabled={phase !== "stream"}
            onClick={() => finishCut(pile)}
            className={`rounded-full border px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
              selectedPile === pile
                ? "border-accent/50 bg-accent/15 text-frost"
                : "border-white/[0.08] text-muted hover:border-accent/30"
            }`}
          >
            堆 {pile + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
