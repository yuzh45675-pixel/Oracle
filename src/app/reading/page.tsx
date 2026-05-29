"use client";

import { Suspense, useEffect, useState } from "react";
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
import { ManualCardPicker } from "@/components/reading/ManualCardPicker";

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
    completeFreeReading,
  } = useReading();
  const { enterWorld } = useTheme();

  const [pickerOpen, setPickerOpen] = useState(false);

  const deckParam = searchParams.get("deck");
  const modeParam = searchParams.get("mode");

  useEffect(() => {
    if (deckParam === "lenormand" || deckParam === "waite") {
      setDeck(deckParam);
      enterWorld(deckParam === "lenormand" ? "lenormand" : "tarot");
      return;
    }
    router.replace("/");
  }, [deckParam, setDeck, router, enterWorld]);

  useEffect(() => {
    if (modeParam === "free" && (deck === "waite" || deck === "lenormand")) {
      setPickerOpen(true);
    }
  }, [modeParam, deck]);

  const isLenormand = deck === "lenormand";
  const canStart = isLenormand
    ? Boolean(lenormandSpread)
    : Boolean(spread && deck === "waite");

  const handleManualConfirm = (cards: import("@/types/tarot").DrawnCard[]) => {
    prepareNewReading();
    const created = completeFreeReading(cards);
    setPickerOpen(false);
    if (created) router.push("/reading/result");
  };

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
      wide
    >
      {/* 先：不选牌阵 · 直接解读 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="mb-3 text-xs tracking-widest text-muted uppercase">
          不选牌阵 · 直接解读
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full rounded-2xl border border-accent/30 bg-accent/[0.06] p-4 text-left transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 lg:p-5"
        >
          <span className="text-[10px] tracking-[0.25em] text-accent uppercase">
            直接解读
          </span>
          <h3 className="mt-1 font-display text-lg font-light text-frost lg:text-xl">
            选择你线下抽到的牌
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {isLenormand
              ? "展开全部 36 张牌面，按你线下真实抽到的顺序勾选，直接交给 AI 解读。"
              : "展开全部 78 张牌面，按你线下真实抽到的顺序勾选并标注正/逆位，直接交给 AI 解读。"}
            （正式版按张数计费，内测阶段免费）
          </p>
        </button>
      </motion.div>

      {/* 或：选择牌阵走完整抽牌仪式 */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p className="mb-3 text-xs tracking-widest text-muted uppercase">
          或 · 选择牌阵
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
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 lg:p-5 ${
                    lenormandSpread === s.type
                      ? "border-accent/40 bg-accent/10 shadow-glow"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <span className="text-[10px] tracking-[0.25em] text-accent uppercase">
                    {s.cardCount} 张
                  </span>
                  <h3 className="mt-1 font-display text-lg font-light text-frost lg:text-xl">
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
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 lg:p-5 ${
                    spread === s.type
                      ? "border-accent/40 bg-accent/10 shadow-glow"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <span className="text-[10px] tracking-[0.25em] text-accent uppercase">
                    {s.cardCount} 张
                  </span>
                  <h3 className="mt-1 font-display text-lg font-light text-frost lg:text-xl">
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
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-frost placeholder:text-muted/50 backdrop-blur-xl outline-none transition-colors focus:border-accent/30 lg:px-5 lg:py-4 lg:text-base"
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
          <p className="mt-3 text-center text-xs text-muted">
            选择牌阵后进入抽牌仪式，或用上方「直接解读」勾选你线下抽到的牌
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 text-xs text-muted/80 underline-offset-4 hover:text-muted hover:underline"
        >
          返回首页切换解读体系
        </button>
      </motion.div>

      {pickerOpen && deck && (
        <ManualCardPicker
          deck={deck}
          onConfirm={handleManualConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}
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
