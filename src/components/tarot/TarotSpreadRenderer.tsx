"use client";

import { motion } from "framer-motion";
import { TarotCard } from "./TarotCard";
import { TarotTable } from "./TarotTable";
import {
  useSpreadContainerSize,
  useSpreadLayout,
} from "@/hooks/useSpreadLayout";
import { useIsMobileLayout } from "@/hooks/useMediaQuery";
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

function MobileSpreadFocus({
  displayCards,
  flipped,
  activeIndex,
  allDone,
  revealedCount,
  onReveal,
}: {
  displayCards: DrawnCard[];
  flipped: boolean[];
  activeIndex: number;
  allDone: boolean;
  revealedCount: number;
  onReveal: () => void;
}) {
  const total = displayCards.length;
  const active = displayCards[activeIndex];

  if (allDone) {
    return (
      <div className="mx-auto w-full max-w-[min(100%,20rem)]">
        <p className="mb-4 text-center text-xs text-muted">
          牌面已全部翻开 · 点击下方查看解读
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-5">
          {displayCards.map((drawn, i) => (
            <div key={`done-${drawn.card.id}-${i}`} className="flex w-[88px] flex-col items-center">
              <TarotCard
                card={drawn.card}
                reversed={drawn.reversed}
                flipped
                settled
                size="xs"
                interactive={false}
              />
              <p className="mt-2 max-w-[88px] text-center text-[9px] leading-tight text-muted">
                {drawn.position}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(100%,18rem)]">
      <div className="mb-4 flex items-center justify-center gap-1.5">
        {displayCards.map((_, i) => (
          <span
            key={`dot-${i}`}
            className={`h-1.5 rounded-full transition-all ${
              i < revealedCount
                ? "w-4 bg-accent"
                : i === activeIndex
                  ? "w-6 bg-accent/50 ring-1 ring-accent/40"
                  : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-[10px] tracking-[0.2em] text-muted uppercase">
        第 {revealedCount + 1} 张 · 共 {total} 张
      </p>
      <p className="mt-2 text-center text-base font-medium text-frost">
        {active?.position ?? "此位置"}
      </p>
      <p className="mt-2 animate-pulse text-center text-xs text-accent">
        ↓ 轻触下方牌背翻开
      </p>

      <div className="mt-5 flex justify-center">
        {active && (
          <motion.div
            key={`active-${activeIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl ring-2 ring-accent/45 ring-offset-4 ring-offset-void"
          >
            <TarotCard
              card={active.card}
              reversed={active.reversed}
              flipped={false}
              onFlip={onReveal}
              size="md"
              interactive
            />
          </motion.div>
        )}
      </div>

      {revealedCount > 0 && (
        <div className="mt-8 border-t border-white/[0.06] pt-5">
          <p className="mb-3 text-center text-[10px] tracking-widest text-muted uppercase">
            已翻开 · 从左到右
          </p>
          <div className="flex justify-start gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayCards.map((drawn, i) =>
              flipped[i] ? (
                <div
                  key={`flipped-${drawn.card.id}-${i}`}
                  className="flex shrink-0 flex-col items-center"
                >
                  <TarotCard
                    card={drawn.card}
                    reversed={drawn.reversed}
                    flipped
                    settled
                    size="xs"
                    interactive={false}
                  />
                  <p className="mt-1.5 max-w-[74px] text-center text-[8px] leading-tight text-muted/90">
                    {drawn.position}
                  </p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TarotSpreadRenderer({
  spread,
  cards,
  flipped,
  revealedCount,
  onReveal,
}: TarotSpreadRendererProps) {
  const isMobile = useIsMobileLayout();
  const layoutMeta = getSpreadLayout(spread);
  const { size: containerSize, tableHeight, setContainerRef } =
    useSpreadContainerSize(layoutMeta.viewport.height);
  const { scaledSlots } = useSpreadLayout(
    spread,
    containerSize.width,
    containerSize.height,
  );

  const expectedCount = layoutMeta.cardCount;
  const displayCards = cards.slice(0, expectedCount);
  const activeIndex = getActiveCardIndex(spread, revealedCount);
  const allDone = revealedCount >= expectedCount;

  if (isMobile) {
    return (
      <MobileSpreadFocus
        displayCards={displayCards}
        flipped={flipped}
        activeIndex={activeIndex}
        allDone={allDone}
        revealedCount={revealedCount}
        onReveal={onReveal}
      />
    );
  }

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
