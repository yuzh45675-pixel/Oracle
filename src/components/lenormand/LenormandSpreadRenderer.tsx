"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LenormandCard } from "./LenormandCard";
import { LenormandTable } from "./LenormandTable";
import { GrandTableauView } from "./GrandTableauView";
import {
  useLenormandSpreadLayout,
  useLenormandTableSize,
} from "@/hooks/useLenormandSpreadLayout";
import { getLenormandLayout } from "@/lib/lenormand/layouts";
import { getLenormandActiveIndex } from "@/lib/lenormand/reveal";
import type { DrawnCard } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

interface LenormandSpreadRendererProps {
  spread: LenormandSpreadType;
  cards: DrawnCard[];
  flipped: boolean[];
  revealedCount: number;
  onReveal: () => void;
}

function cardSize(count: number): "sm" | "md" | "lg" {
  if (count <= 3) return "lg";
  if (count <= 7) return "md";
  return "sm";
}

export function LenormandSpreadRenderer({
  spread,
  cards,
  flipped,
  revealedCount,
  onReveal,
}: LenormandSpreadRendererProps) {
  if (spread === "tableau") {
    return (
      <GrandTableauView
        cards={cards}
        flipped={flipped}
        revealedCount={revealedCount}
        onReveal={onReveal}
      />
    );
  }

  const layoutMeta = getLenormandLayout(spread);
  const { containerSize, tableHeight, setContainerRef } = useLenormandTableSize(
    layoutMeta.viewport.height,
    spread
  );
  const { scaledSlots } = useLenormandSpreadLayout(
    spread,
    containerSize.width,
    containerSize.height
  );

  const expectedCount = layoutMeta.cardCount;
  const displayCards = cards.slice(0, expectedCount);
  const activeIndex = getLenormandActiveIndex(spread, revealedCount);
  const allDone = revealedCount >= expectedCount;
  const size = cardSize(expectedCount);

  return (
    <LenormandTable
      className="mx-auto w-full"
      style={{ height: tableHeight, minHeight: 300 }}
    >
      <div ref={setContainerRef} className="relative h-full w-full">
        {displayCards.map((drawn, i) => {
          const slot = scaledSlots[i];
          if (!slot || !drawn?.card?.id) return null;

          const isFlipped = flipped[i];
          const isActive = !allDone && i === activeIndex && !isFlipped;
          const canFlip = isActive;

          return (
            <motion.div
              key={`${drawn.slotId ?? drawn.card.id}-${i}`}
              className="absolute left-0 top-0"
              style={{
                left: slot.x,
                top: slot.y,
                zIndex: isActive ? 200 : isFlipped ? 50 + i : slot.zIndex + 10,
                pointerEvents: canFlip || isFlipped ? "auto" : "none",
                transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
                transformOrigin: "center center",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <motion.div
                className="relative inline-block"
                initial={{ scale: 0.92, y: 8 }}
                animate={{ scale: isActive ? 1.04 : 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  delay: i * 0.03,
                }}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 w-max -translate-x-1/2 text-center text-[9px] tracking-wider text-muted/90">
                  {drawn.position}
                  {isActive ? " · 翻开" : ""}
                </span>
                <LenormandCard
                  card={drawn.card}
                  flipped={isFlipped}
                  settled={isFlipped}
                  onFlip={canFlip ? onReveal : undefined}
                  size={size}
                  interactive={canFlip}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </LenormandTable>
  );
}
