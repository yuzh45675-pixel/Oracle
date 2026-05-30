"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LenormandDrawFlow } from "@/components/lenormand/LenormandDrawFlow";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { ShuffleDeck } from "@/components/tarot/ShuffleDeck";
import { CutRitualPanel } from "@/components/tarot/CutRitualPanel";
import { JumpCardEffect } from "@/components/tarot/JumpCardEffect";
import { TarotSpreadRenderer } from "@/components/tarot/TarotSpreadRenderer";
import { RitualStepGuide } from "@/components/tarot/RitualStepGuide";
import { RitualStepGuideToggle } from "@/components/tarot/RitualStepGuideToggle";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useReading } from "@/context/ReadingContext";
import { useRitualStepGuide } from "@/hooks/useRitualStepGuide";
import { loadReadingSetup } from "@/lib/reading-session";
import {
  getActiveCardIndex,
  getExpectedCardCount,
  getRevealPrompt,
} from "@/lib/spreadReveal";
import { FLIP_GUIDANCE } from "@/types/tarot";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { ritualParticleDissolve } from "@/lib/ritual-performance";

export default function DrawPage() {
  const router = useRouter();
  const { triggerBurst } = useParticleInteraction();
  const {
    spread,
    lenormandSpread,
    deck,
    setDeck,
    setSpread,
    setLenormandSpread,
    setQuestion,
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
  const [ready, setReady] = useState(false);
  const { enabled: stepGuideEnabled, setEnabled: setStepGuideEnabled } =
    useRitualStepGuide();

  const expectedCount = spread ? getExpectedCardCount(spread) : 0;
  const spreadCards = useMemo(
    () => cards.slice(0, expectedCount),
    [cards, expectedCount]
  );

  useEffect(() => {
    const saved = loadReadingSetup();
    if (saved && "spread" in saved) {
      setDeck(saved.deck);
      if (saved.deck === "lenormand") {
        setLenormandSpread(saved.spread);
      } else {
        setSpread(saved.spread);
      }
      setQuestion(saved.question ?? "");
    }
    prepareNewReading();
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset once on mount
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (deck === "lenormand" && lenormandSpread) return;
    if (deck === "waite" && spread) return;
    const saved = loadReadingSetup();
    if (saved?.deck) return;
    router.replace("/");
  }, [ready, deck, spread, lenormandSpread, router]);

  useEffect(() => {
    if (ritualPhase !== "spread" || expectedCount === 0) return;
    if (spreadCards.length !== expectedCount) {
      prepareNewReading();
      return;
    }
    setFlipped(new Array(expectedCount).fill(false));
    setRevealedCount(0);
  }, [ritualPhase, expectedCount, spreadCards.length, prepareNewReading]);

  const revealPrompt = useMemo(() => {
    if (!spread || spreadCards.length === 0) return "";
    return getRevealPrompt(spread, spreadCards, revealedCount);
  }, [spread, spreadCards, revealedCount]);

  const breathGuidance = useMemo(() => {
    return FLIP_GUIDANCE[revealedCount % FLIP_GUIDANCE.length];
  }, [revealedCount]);

  const handleRevealNext = () => {
    if (!spread || revealedCount >= expectedCount) return;
    const activeIndex = getActiveCardIndex(spread, revealedCount);
    triggerBurst();
    if (navigator.vibrate) navigator.vibrate(6);
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
      ? "\u51c6\u5907\u4eea\u5f0f"
      : ritualPhase === "shuffling"
        ? "\u6d17\u724c"
        : ritualPhase === "cutting"
          ? "\u5207\u724c"
          : allRevealed
            ? "\u724c\u9762\u5df2\u63ed\u793a"
            : "\u63ed\u793a\u724c\u9762";

  const subtitle =
    ritualPhase === "idle"
      ? "\u8ba9\u610f\u5ff5\u878d\u5165\u724c\u7ec4\uff0c\u5f00\u59cb\u6d17\u724c"
      : ritualPhase === "shuffling"
        ? "\u611f\u53d7\u724c\u5728\u6307\u95f4\u6d41\u52a8\u2026\u2026"
        : ritualPhase === "cutting"
          ? "左右滑动浏览 · 轻触牌背选中 · 选满后点确认"
          : allRevealed
            ? "\u724c\u9762\u5df2\u5168\u90e8\u63ed\u793a"
            : revealPrompt || `\u8f7b\u89e6\u724c\u9762\u63ed\u793a\u7b2c ${revealedCount + 1} \u5f20`;

  if (deck === "lenormand") {
    return <LenormandDrawFlow />;
  }

  return (
    <ReadingLayout
      title={title}
      subtitle={subtitle}
      dissolve={ritualParticleDissolve(ritualPhase)}
      wide={ritualPhase === "cutting" || ritualPhase === "spread"}
      performanceMode={ritualPhase === "cutting"}
    >
      <RitualStepGuideToggle
        enabled={stepGuideEnabled}
        onChange={setStepGuideEnabled}
      />

      {stepGuideEnabled && ritualPhase === "idle" && (
        <RitualStepGuide
          step={1}
          total={4}
          title="点击下方「开始洗牌」"
          hint="静心默念你的问题，再开始仪式"
        />
      )}
      {stepGuideEnabled && ritualPhase === "shuffling" && (
        <RitualStepGuide
          step={2}
          total={4}
          title="牌在自动洗牌，请稍候"
          hint="若出现跳牌，会纳入本次解读"
        />
      )}
      {stepGuideEnabled && ritualPhase === "cutting" && (
        <RitualStepGuide
          step={3}
          total={4}
          title="从牌堆中选出本次牌阵所需的牌"
          hint="轻触牌背选中 · 选满后点「确认选牌」"
        />
      )}
      {stepGuideEnabled && ritualPhase === "spread" && !allRevealed && (
        <RitualStepGuide
          step={4}
          total={4}
          title="按顺序逐张翻开牌面"
          hint="每次只翻一张 · 轻触下方高亮牌背"
        />
      )}

      <AnimatePresence mode="wait">
        {ritualPhase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <ShuffleDeck isShuffling={false} />
            <motion.div className="mt-6 md:mt-12">
              <AnimatedButton onClick={startRitual}>
                {"\u5f00\u59cb\u6d17\u724c"}
              </AnimatedButton>
            </motion.div>
          </motion.div>
        )}

        {ritualPhase === "shuffling" && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-full max-w-[17rem] sm:max-w-md lg:max-w-xl">
              <ShuffleDeck isShuffling={isShuffling} />
              <JumpCardEffect
                jumpCard={jumpCard}
                showNotice={showJumpNotice}
                active={!!jumpCard}
              />
            </div>
            {showJumpNotice && (
              <motion.p
                className="mt-6 max-w-sm text-center text-xs leading-relaxed text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {"\u4f60\u4f3c\u4e4e\u9057\u6f0f\u4e86\u67d0\u79cd\u4fe1\u606f\u3002\u6b64\u724c\u5c06\u7eb3\u5165\u89e3\u8bfb\u3002"}
              </motion.p>
            )}
          </motion.div>
        )}

        {ritualPhase === "cutting" && (
          <motion.div
            key="cut"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CutRitualPanel
              spreadCardCount={expectedCount || 3}
              pool={shuffledPool}
              excludeIds={jumpCard?.card.id ? [jumpCard.card.id] : []}
              onComplete={completeCut}
            />
          </motion.div>
        )}

        {ritualPhase === "spread" &&
          spread &&
          spreadCards.length === expectedCount && (
            <motion.div
              key={`spread-${spread}-${expectedCount}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="flex w-full max-w-none flex-col items-center"
            >
              {jumpCard && (
                <motion.p
                  className="mx-auto mb-4 max-w-md text-center text-xs text-accent/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {`\u8df3\u724c\uff1a${jumpCard.card.name} \u2014 \u5df2\u7eb3\u5165\u672c\u6b21\u89e3\u8bfb`}
                </motion.p>
              )}

              {!allRevealed && (
                <motion.div
                  key={`${revealedCount}-${revealPrompt}`}
                  className="mx-auto mb-6 hidden max-w-lg space-y-2 text-center md:block lg:max-w-2xl lg:mb-8"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm font-medium text-frost lg:text-base">{revealPrompt}</p>
                  <p className="text-xs leading-relaxed text-muted lg:text-sm">
                    {breathGuidance}
                  </p>
                </motion.div>
              )}

              <TarotSpreadRenderer
                spread={spread}
                cards={spreadCards}
                flipped={flipped}
                revealedCount={revealedCount}
                onReveal={handleRevealNext}
              />

              <motion.div className="mt-8 flex flex-col items-center gap-4 md:mt-10">
                {!allRevealed && (
                  <p className="hidden text-xs text-muted md:block">
                    {
                      "\u5e26\u6709\u5149\u6655\u7684\u724c\u4e3a\u5f53\u524d\u5e94\u7ffb\u5f00\u7684\u4f4d\u7f6e\uff1b\u6309\u63d0\u793a\u987a\u5e8f\u7ffb\u724c"
                    }
                  </p>
                )}
                {allRevealed && (
                  <AnimatedButton href="/reading/result">
                    {"\u89e3\u8bfb"}
                  </AnimatedButton>
                )}
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>
    </ReadingLayout>
  );
}
