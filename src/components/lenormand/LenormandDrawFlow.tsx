"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LenormandReadingLayout } from "./LenormandReadingLayout";
import { ShuffleDeck } from "@/components/tarot/ShuffleDeck";
import { LenormandSpreadRenderer } from "./LenormandSpreadRenderer";
import { LenormandCard } from "./LenormandCard";
import { CutRitualPanel } from "@/components/tarot/CutRitualPanel";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useReading } from "@/context/ReadingContext";
import {
  getLenormandExpectedCount,
  getLenormandActiveIndex,
  getLenormandRevealPrompt,
} from "@/lib/lenormand/reveal";

export function LenormandDrawFlow() {
  const {
    lenormandSpread: spread,
    ritualPhase,
    isShuffling,
    jumpCard,
    showJumpNotice,
    startRitual,
    completeCut,
    cards,
    shuffledPool,
    prepareNewReading,
  } = useReading();

  const [revealedCount, setRevealedCount] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>([]);

  const expectedCount = spread ? getLenormandExpectedCount(spread) : 0;
  const spreadCards = useMemo(
    () => cards.slice(0, expectedCount),
    [cards, expectedCount]
  );

  useEffect(() => {
    if (ritualPhase !== "spread" || !spread || expectedCount === 0) return;
    if (spreadCards.length !== expectedCount) {
      prepareNewReading();
      return;
    }
    if (spread === "tableau") {
      setFlipped(new Array(expectedCount).fill(true));
      setRevealedCount(expectedCount);
    } else {
      setFlipped(new Array(expectedCount).fill(false));
      setRevealedCount(0);
    }
  }, [ritualPhase, spread, expectedCount, spreadCards.length, prepareNewReading]);

  const revealPrompt = useMemo(() => {
    if (!spread) return "";
    return getLenormandRevealPrompt(spread, spreadCards, revealedCount);
  }, [spread, spreadCards, revealedCount]);

  const handleRevealNext = () => {
    if (!spread || revealedCount >= expectedCount) return;
    if (spread === "tableau") {
      setFlipped(new Array(expectedCount).fill(true));
      setRevealedCount(expectedCount);
      return;
    }
    const activeIndex = getLenormandActiveIndex(spread, revealedCount);
    setFlipped((prev) => {
      const next = [...prev];
      next[activeIndex] = true;
      return next;
    });
    setRevealedCount((c) => c + 1);
  };

  const allRevealed =
    ritualPhase === "spread" &&
    expectedCount > 0 &&
    spreadCards.length === expectedCount &&
    revealedCount >= expectedCount;

  const title =
    ritualPhase === "idle"
      ? "准备"
      : ritualPhase === "shuffling"
        ? "洗牌"
        : ritualPhase === "cutting"
          ? "切牌"
          : allRevealed
            ? "牌面已展开"
            : "揭示牌面";

  const isTableau = spread === "tableau";

  return (
    <LenormandReadingLayout
      title={title}
      subtitle={
        ritualPhase === "idle"
          ? "雷诺曼以组合关系解读事件，请静心后开始。"
          : ritualPhase === "shuffling"
            ? "纸牌在桌面上摩擦、聚拢……"
            : ritualPhase === "cutting"
              ? "滑动选牌，或切换为选堆切牌"
              : revealPrompt
      }
      wide={isTableau || ritualPhase === "spread"}
    >
      <AnimatePresence mode="wait">
        {ritualPhase === "idle" && (
          <motion.div
            key="idle"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShuffleDeck isShuffling={false} />
            <AnimatedButton className="mt-10" onClick={startRitual}>
              开始洗牌
            </AnimatedButton>
          </motion.div>
        )}

        {ritualPhase === "shuffling" && (
          <motion.div
            key="shuffle"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ShuffleDeck isShuffling={isShuffling} />
            {showJumpNotice && jumpCard && (
              <motion.div
                className="mt-8 flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-muted">
                  有一张牌提前显现。
                </p>
                <div className="w-24">
                  <LenormandCard card={jumpCard.card} flipped settled size="sm" />
                </div>
                <p className="text-xs text-muted">{jumpCard.card.name}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {ritualPhase === "cutting" && (
          <motion.div key="cut" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CutRitualPanel
              spreadCardCount={expectedCount || 3}
              pool={shuffledPool}
              excludeIds={jumpCard?.card.id ? [jumpCard.card.id] : []}
              onComplete={completeCut}
            />
          </motion.div>
        )}

        {ritualPhase === "spread" && spread && spreadCards.length === expectedCount && (
          <motion.div
            key="spread"
            className="flex w-full max-w-4xl flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LenormandSpreadRenderer
              spread={spread}
              cards={spreadCards}
              flipped={flipped}
              revealedCount={revealedCount}
              onReveal={handleRevealNext}
            />

            <div className="mt-10">
              {!allRevealed && spread !== "tableau" && (
                <p className="mb-4 text-center text-xs text-muted">
                  按位置顺序翻开；组合意义在全部揭示后呈现。
                </p>
              )}
              {allRevealed && (
                <AnimatedButton href="/reading/result">查看组合解读</AnimatedButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LenormandReadingLayout>
  );
}
