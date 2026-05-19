"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShuffleDeck } from "@/components/tarot/ShuffleDeck";
import { CutDeckAnimation } from "@/components/tarot/CutDeckAnimation";
import { TarotCard } from "@/components/tarot/TarotCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useSupplementShuffle } from "@/hooks/useSupplementShuffle";
import type { DeckType, DrawnCard } from "@/types/tarot";

type Phase = "pick" | "idle" | "shuffling" | "cutting" | "reveal" | "done";

type SupplementDrawFlowProps = {
  deck: DeckType;
  excludeCardIds: string[];
  onComplete: (cards: DrawnCard[]) => void;
  onCancel: () => void;
};

const COUNT_OPTIONS = [1, 2, 3] as const;

export function SupplementDrawFlow({
  deck,
  excludeCardIds,
  onComplete,
  onCancel,
}: SupplementDrawFlowProps) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [cardCount, setCardCount] = useState<1 | 2 | 3>(1);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState(0);

  const { isShuffling, runShuffle, drawFromPool, resetShuffle } =
    useSupplementShuffle();

  const handlePickCount = (n: 1 | 2 | 3) => {
    setCardCount(n);
    setPhase("idle");
  };

  const handleStartShuffle = async () => {
    setPhase("shuffling");
    await runShuffle(deck, excludeCardIds);
    setPhase("cutting");
  };

  const handleCut = useCallback(
    (_pileIndex: number) => {
      const cards = drawFromPool(deck, cardCount, excludeCardIds);
      setDrawn(cards);
      setRevealed(0);
      setPhase("reveal");
    },
    [deck, cardCount, excludeCardIds, drawFromPool],
  );

  const handleRevealNext = () => {
    if (revealed >= drawn.length) return;
    setRevealed((c) => c + 1);
    if (revealed + 1 >= drawn.length) {
      setTimeout(() => setPhase("done"), 400);
    }
  };

  const handleConfirm = () => {
    onComplete(drawn);
    resetShuffle();
  };

  const handleRedraw = () => {
    setDrawn([]);
    setRevealed(0);
    resetShuffle();
    setPhase("pick");
  };

  const title =
    phase === "pick"
      ? "选择补牌张数"
      : phase === "idle"
        ? "准备补牌"
        : phase === "shuffling"
          ? "洗牌"
          : phase === "cutting"
            ? "切牌"
            : phase === "reveal"
              ? "揭示补牌"
              : "补牌完成";

  const subtitle =
    phase === "pick"
      ? "最多可抽 3 张，用于追问时的额外指引"
      : phase === "idle"
        ? "静心片刻，然后开始洗牌"
        : phase === "shuffling"
          ? "感受牌在指间流动……"
          : phase === "cutting"
            ? "凭直觉选择一堆，完成切牌"
            : phase === "reveal"
              ? revealed < drawn.length
                ? `轻触牌面，揭示第 ${revealed + 1} 张`
                : "已全部揭示"
              : "确认后可输入追问并发送";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] tracking-widest text-accent uppercase">
            补牌仪式
          </p>
          <h3 className="mt-1 font-display text-lg text-frost">{title}</h3>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
        {phase !== "done" && (
          <button
            type="button"
            onClick={() => {
              resetShuffle();
              onCancel();
            }}
            className="shrink-0 text-xs text-muted hover:text-frost"
          >
            取消
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handlePickCount(n)}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 py-4 text-sm text-frost transition hover:border-accent/40 hover:bg-accent/10"
              >
                抽 {n} 张
              </button>
            ))}
          </motion.div>
        )}

        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <ShuffleDeck isShuffling={false} />
            <motion.div className="mt-8 flex flex-wrap justify-center gap-3">
              <AnimatedButton onClick={() => void handleStartShuffle()}>
                开始洗牌
              </AnimatedButton>
              <button
                type="button"
                onClick={() => setPhase("pick")}
                className="px-4 py-2 text-xs text-muted hover:text-frost"
              >
                重选张数
              </button>
            </motion.div>
          </motion.div>
        )}

        {phase === "shuffling" && (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <ShuffleDeck isShuffling={isShuffling} />
          </motion.div>
        )}

        {phase === "cutting" && (
          <motion.div
            key="cut"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CutDeckAnimation onCutComplete={handleCut} />
          </motion.div>
        )}

        {phase === "reveal" && drawn.length > 0 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {drawn.map((d, i) => (
                <div key={d.card.id} className="flex flex-col items-center gap-2">
                  <TarotCard
                    card={d.card}
                    reversed={d.reversed}
                    flipped={i < revealed}
                    settled={i < revealed}
                    onFlip={i === revealed ? handleRevealNext : undefined}
                    size="md"
                    interactive={i === revealed}
                  />
                  {i < revealed && (
                    <p className="max-w-[8rem] text-center text-xs text-muted">
                      {d.card.name}
                      {deck === "waite" && d.reversed ? "·逆" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {revealed < drawn.length && (
              <p className="mt-6 text-xs text-accent/80">点击当前牌面以揭示</p>
            )}
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {drawn.map((d) => (
                <motion.div
                  key={d.card.id}
                  className="flex flex-col items-center gap-1 rounded-lg border border-accent/20 bg-accent/5 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.card.image}
                    alt={d.card.name}
                    className="h-24 w-16 rounded object-contain bg-[#f5f0e8]"
                  />
                  <span className="text-xs text-frost">
                    {d.card.name}
                    {deck === "waite" && d.reversed ? "·逆" : ""}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <AnimatedButton onClick={handleConfirm}>确认补牌，去追问</AnimatedButton>
              <button
                type="button"
                onClick={handleRedraw}
                className="px-4 py-2 text-xs text-muted hover:text-frost"
              >
                重新抽牌
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
