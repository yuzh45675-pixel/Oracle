"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCard } from "./TarotCard";
import type { DrawnCard } from "@/types/tarot";

interface JumpCardEffectProps {
  jumpCard: DrawnCard | null;
  showNotice: boolean;
  active: boolean;
}

export function JumpCardEffect({
  jumpCard,
  showNotice,
  active,
}: JumpCardEffectProps) {
  const { angle, driftX } = useMemo(
    () => ({
      angle: -18 + Math.random() * 36,
      driftX: -80 + Math.random() * 160,
    }),
    [jumpCard?.card.id]
  );

  if (!active || !jumpCard) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      <AnimatePresence>
        {showNotice && (
          <motion.p
            className="absolute left-1/2 top-4 z-40 max-w-xs -translate-x-1/2 text-center text-xs tracking-wide text-accent/90"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            有一张牌主动出现了。
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute left-1/2 top-1/2 z-30"
        initial={{
          x: "-50%",
          y: "-60%",
          rotateZ: 0,
          scale: 0.85,
          filter: "blur(0px)",
        }}
        animate={{
          x: `calc(-50% + ${driftX}px)`,
          y: "calc(-50% + 100px)",
          rotateZ: angle,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          mass: 1.2,
        }}
        style={{
          boxShadow: "0 28px 50px rgba(0,0,0,0.55)",
        }}
      >
        <motion.div
          animate={{ filter: ["blur(2px)", "blur(0px)"] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TarotCard
            card={jumpCard.card}
            reversed={jumpCard.reversed}
            flipped
            settled
            size="md"
            interactive={false}
          />
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute -inset-4 rounded-full bg-accent/20 blur-xl"
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </div>
  );
}
