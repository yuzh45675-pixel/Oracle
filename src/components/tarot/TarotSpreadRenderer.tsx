"use client";

import { motion } from "framer-motion";
import { TarotCard } from "./TarotCard";
import { TarotTable } from "./TarotTable";
import {
  useSpreadContainerSize,
  useSpreadLayout,
} from "@/hooks/useSpreadLayout";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import { getActiveCardIndex } from "@/lib/spreadReveal";
import type { DrawnCard, SpreadType } from "@/types/tarot";

interface TarotSpreadRendererProps {
  spread: SpreadType;
  cards: DrawnCard[];
  flipped: boolean[];
  revealedCount: number;
  onReveal: () => void;
}

function cardSizeForCount(count: number): "sm" | "md" | "lg" {
  if (count <= 3) return "lg";
  if (count <= 7) return "md";
  return "sm";
}

export function TarotSpreadRenderer({
  spread,
  cards,
  flipped,
  revealedCount,
  onReveal,
}: TarotSpreadRendererProps) {
  const layoutMeta = getSpreadLayout(spread);
  const { size: containerSize, tableHeight, setContainerRef } =
    useSpreadContainerSize(layoutMeta.viewport.height);
  const { scaledSlots } = useSpreadLayout(
    spread,
    containerSize.width,
    containerSize.height
  );

  const expectedCount = layoutMeta.cardCount;
  const displayCards = cards.slice(0, expectedCount);
  const activeIndex = getActiveCardIndex(spread, revealedCount);
  const allDone = revealedCount >= expectedCount;

  const size = cardSizeForCount(expectedCount);
  const enablePan = containerSize.width < 768 && expectedCount > 5;

  return (
    <TarotTable
      className="mx-auto w-full"
      style={{ height: tableHeight, minHeight: 320 }}
      enablePan={enablePan}
    >
      <motion.div ref={setContainerRef} className="relative h-full w-full">
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
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                delay: i * 0.04,
              }}
            >
              <motion.div
                className="relative inline-block"
                initial={{ scale: 0.88 }}
                animate={{ scale: isActive ? 1.04 : 1 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  delay: i * 0.04,
                }}
              >
              <span
                className={`pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[120px] -translate-x-1/2 whitespace-nowrap text-center text-[9px] tracking-[0.25em] uppercase md:text-[10px] lg:max-w-none lg:text-xs ${
                  isActive ? "text-accent" : "text-muted/90"
                }`}
              >
                {drawn.position}
                {isActive ? " · 翻开" : ""}
              </span>
              <motion.div
                className={`rounded-xl ${isActive ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-transparent" : ""}`}
                animate={
                  isActive
                    ? {
                        boxShadow: [
                          "0 0 0 rgba(110,91,255,0)",
                          "0 0 28px rgba(110,91,255,0.35)",
                          "0 0 0 rgba(110,91,255,0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TarotCard
                  card={drawn.card}
                  reversed={drawn.reversed}
                  flipped={isFlipped}
                  settled={isFlipped}
                  onFlip={canFlip ? onReveal : undefined}
                  size={size}
                  interactive={canFlip}
                />
              </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </TarotTable>
  );
}
