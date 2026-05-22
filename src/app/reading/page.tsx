"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useReading } from "@/context/ReadingContext";
import { useTheme } from "@/context/ThemeContext";
import { saveReadingSetup } from "@/lib/reading-session";
import { LENORMAND_SPREADS } from "@/lib/lenormand/layouts";
import { SPREADS } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

const DECK_LABEL = {
  waite: "维特塔罗",
  lenormand: "雷诺曼",
} as const;

function ReadingStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    deck,
    spread,
    lenormandSpread,
    setDeck,
    setSpread,
    setLenormandSpread,
    question,
    setQuestion,
    prepareNewReading,
  } = useReading();
  const { enterWorld } = useTheme();

  const deckParam = searchParams.get("deck");

  useEffect(() => {
    if (deckParam === "lenormand" || deckParam === "waite") {
      setDeck(deckParam);
      enterWorld(deckParam === "lenormand" ? "lenormand" : "tarot");
      return;
    }
    router.replace("/");
  }, [deckParam, setDeck, router, enterWorld]);

  const isLenormand = deck === "lenormand";
  const canStart = isLenormand
    ? Boolean(lenormandSpread)
    : Boolean(spread && deck === "waite");

  const handleStart = () => {
    if (!deck) return;
    prepareNewReading();
    if (deck === "lenormand" && lenormandSpread) {
      saveReadingSetup({
        deck: "lenormand",
        spread: lenormandSpread,
        question: question.trim() || undefined,
      });
    } else if (deck === "waite" && spread) {
      saveReadingSetup({
        deck: "waite",
        spread,
        question: question.trim() || undefined,
      });
    } else {
      return;
    }
    router.push("/reading/draw");
  };

  if (!deckParam || (deckParam !== "waite" && deckParam !== "lenormand")) {
    return null;
  }

  const systemLabel = deck === "lenormand" ? DECK_LABEL.lenormand : DECK_LABEL.waite;

  return (
    <ReadingLayout
      title="选择牌阵"
      subtitle={
        isLenormand
          ? `${systemLabel} · 以牌与牌之间的关系为核心，选定牌阵后开始。`
          : `${systemLabel} · 静心片刻，你可默念问题，或保持空白。`
      }
      badge={isLenormand ? "Lenormand Reading" : "Oracle Reading"}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="mb-3 text-xs tracking-widest text-muted uppercase">
          牌阵
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLenormand
            ? LENORMAND_SPREADS.map((s, i) => (
                <motion.button
                  key={s.type}
                  type="button"
                  onClick={() => {
                    setLenormandSpread(s.type as LenormandSpreadType);
                    prepareNewReading();
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                    lenormandSpread === s.type
                      ? "border-accent/40 bg-accent/10 shadow-glow"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                >
                  <span className="text-[10px] tracking-[0.25em] text-accent uppercase">
                    {s.cardCount} 张
                  </span>
                  <h3 className="mt-1 font-display text-lg font-light text-frost">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {s.desc}
                  </p>
                </motion.button>
              ))
            : SPREADS.map((s, i) => (
                <motion.button
                  key={s.type}
                  type="button"
                  onClick={() => {
                    setSpread(s.type);
                    prepareNewReading();
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                    spread === s.type
                      ? "border-accent/40 bg-accent/10 shadow-glow"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                >
                  <span className="text-[10px] tracking-[0.25em] text-accent uppercase">
                    {s.cardCount} 张
                  </span>
                  <h3 className="mt-1 font-display text-lg font-light text-frost">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {s.desc}
                  </p>
                </motion.button>
              ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label className="mb-1 block text-xs tracking-widest text-muted uppercase">
          你的问题
        </label>
        <p className="mb-3 text-xs leading-relaxed text-muted/90">
          登录后每日 3 次免费 AI 解读（DeepSeek）；内测阶段超出次数可免费继续，正式版将接入支付宝。填写问题可在结果页获得神谕解读。
        </p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：接下来两周工作上会发生什么？"
          rows={3}
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-frost placeholder:text-muted/50 backdrop-blur-xl outline-none transition-colors focus:border-accent/30"
        />
      </motion.div>

      <motion.div
        className="mt-10 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <AnimatedButton onClick={handleStart} disabled={!canStart}>
          进入抽牌
        </AnimatedButton>
        {!canStart && (
          <p className="mt-3 text-center text-xs text-muted">请先选择牌阵</p>
        )}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 text-xs text-muted/80 underline-offset-4 hover:text-muted hover:underline"
        >
          返回首页切换解读体系
        </button>
      </motion.div>
    </ReadingLayout>
  );
}

export default function ReadingStartPage() {
  return (
    <Suspense fallback={null}>
      <ReadingStartContent />
    </Suspense>
  );
}
