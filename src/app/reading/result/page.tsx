"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { LenormandReadingLayout } from "@/components/lenormand/LenormandReadingLayout";
import { CombinationPanel } from "@/components/lenormand/CombinationPanel";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useReading } from "@/context/ReadingContext";
import {
  orderCardsForReading,
  validateDrawnCards,
} from "@/lib/spreadReveal";
import { orderLenormandCardsForReading } from "@/lib/lenormand/reveal";
import { buildLenormandCombinations } from "@/lib/lenormand/combinationEngine";
import { getMeaning } from "@/lib/tarot";
import { SPREAD_LABELS } from "@/types/tarot";
import { LENORMAND_SPREAD_LABELS } from "@/lib/lenormand/layouts";
import { buildCardReadingSnapshots } from "@/lib/build-reading-snapshot";
import { AiOraclePanel } from "@/components/reading/AiOraclePanel";
import { ReadingExportButton } from "@/components/reading/ReadingExportButton";
import { BetaFeedbackSurvey } from "@/components/reading/BetaFeedbackSurvey";

export default function ResultPage() {
  const router = useRouter();
  const {
    deck,
    spread,
    lenormandSpread,
    cards,
    jumpCard,
    combinations,
    question,
    session,
    persistSession,
    updateSession,
    reset,
  } = useReading();

  const isLenormand = deck === "lenormand";
  const persistedRef = useRef<string | null>(null);

  const orderedCards = useMemo(() => {
    const valid = validateDrawnCards(cards);
    if (isLenormand && lenormandSpread) {
      return orderLenormandCardsForReading(lenormandSpread, valid);
    }
    if (!spread || valid.length === 0) return valid;
    return orderCardsForReading(spread, valid);
  }, [cards, spread, lenormandSpread, isLenormand]);

  const lenormandCombos = useMemo(() => {
    if (!isLenormand || !lenormandSpread) return combinations;
    if (combinations.length > 0) return combinations;
    return buildLenormandCombinations(lenormandSpread, orderedCards);
  }, [isLenormand, lenormandSpread, combinations, orderedCards]);

  useEffect(() => {
    if (!cards.length) {
      router.replace("/reading");
      return;
    }
    if (orderedCards.length === 0) {
      router.replace("/reading/draw");
      return;
    }
    const key = session?.id ?? "pending";
    if (persistedRef.current === key) return;
    persistedRef.current = key;
    persistSession({
      cardReadings: buildCardReadingSnapshots(orderedCards),
      combinations: isLenormand ? lenormandCombos : undefined,
    });
  }, [
    cards.length,
    orderedCards,
    lenormandCombos,
    isLenormand,
    router,
    persistSession,
    session?.id,
  ]);

  const spreadTitle = isLenormand
    ? lenormandSpread
      ? LENORMAND_SPREAD_LABELS[lenormandSpread]
      : "雷诺曼"
    : spread
      ? SPREAD_LABELS[spread]
      : "牌阵";

  const jumpSummary = jumpCard?.card
    ? `提前显现的「${jumpCard.card.name}」：${jumpCard.card.upright.summary} 此牌已纳入本次组合叙事。`
    : undefined;

  if (isLenormand) {
    return (
      <LenormandReadingLayout
        title="组合解读"
        subtitle={
          question
            ? `${spreadTitle} · 关于「${question}」`
            : `${spreadTitle} · 以牌际关系阅读事件`
        }
        wide
      >
        <CombinationPanel
          combinations={lenormandCombos}
          jumpSummary={jumpSummary}
        />

        {deck && (
          <AiOraclePanel
            deck={deck}
            spreadTitle={spreadTitle}
            question={question}
            cards={orderedCards}
            jumpCard={jumpCard}
            combinations={lenormandCombos}
            onSessionUpdate={updateSession}
          />
        )}

        {session?.aiInterpretation && (
          <motion.div className="mt-8 flex justify-center">
            <ReadingExportButton session={session} />
          </motion.div>
        )}

        <BetaFeedbackSurvey />

        {lenormandSpread !== "tableau" && (
          <motion.div className="mt-10 space-y-4">
            <p className="text-[10px] tracking-widest text-muted uppercase">
              牌位一览
            </p>
            {orderedCards.map((drawn, i) => (
              <article
                key={`${drawn.card.id}-${i}`}
                className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl"
              >
                <motion.div
                  className="h-28 w-[4.5rem] shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={drawn.card.image}
                    alt={drawn.card.name}
                    className="h-full w-full rounded-lg object-contain bg-[#f5f0e8]"
                  />
                </motion.div>
                <div>
                  <p className="text-[10px] text-accent/80">{drawn.position}</p>
                  <h3 className="font-display text-lg text-frost">
                    {drawn.card.name}
                    <span className="ml-2 text-sm font-sans text-muted">
                      {drawn.card.nameEn}
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {drawn.card.keywords.join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        )}

        <motion.div className="mt-12 flex flex-wrap justify-center gap-4">
          <AnimatedButton
            onClick={() => {
              const deckType = deck ?? "lenormand";
              reset();
              router.push(`/reading?deck=${deckType}`);
            }}
          >
            新的占卜
          </AnimatedButton>
          <AnimatedButton href="/history" variant="ghost">
            查看记录
          </AnimatedButton>
        </motion.div>
      </LenormandReadingLayout>
    );
  }

  return (
    <ReadingLayout
      title="解读"
      subtitle={
        question
          ? `${spreadTitle} · 关于「${question}」`
          : `${spreadTitle} · 牌面已为你展开`
      }
      wide
    >
      {jumpCard?.card?.id && (
        <motion.article
          className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-6 backdrop-blur-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs tracking-widest text-accent uppercase">跳牌</p>
          <h3 className="mt-2 font-display text-xl text-frost">
            {jumpCard.card.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {getMeaning(jumpCard.card, jumpCard.reversed).summary}
          </p>
        </motion.article>
      )}

      <motion.div className="space-y-6 lg:space-y-8">
        {orderedCards.map((drawn, i) => (
          <ResultPanel
            key={`${drawn.slotId ?? drawn.card.id}-${i}`}
            drawn={drawn}
            index={i}
          />
        ))}
      </motion.div>

      {deck && (
        <AiOraclePanel
          deck={deck}
          spreadTitle={spreadTitle}
          question={question}
          cards={orderedCards}
          jumpCard={jumpCard}
          onSessionUpdate={updateSession}
        />
      )}

      {session?.aiInterpretation && (
        <motion.div className="mt-8 flex justify-center">
          <ReadingExportButton session={session} />
        </motion.div>
      )}

      <BetaFeedbackSurvey />

      <motion.div className="mt-12 flex flex-wrap justify-center gap-4">
        <AnimatedButton
          onClick={() => {
            reset();
            router.push("/reading");
          }}
        >
          新的占卜
        </AnimatedButton>
        <AnimatedButton href="/history" variant="ghost">
          查看记录
        </AnimatedButton>
      </motion.div>
    </ReadingLayout>
  );
}
