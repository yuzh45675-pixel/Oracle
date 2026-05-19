"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { clearHistory, loadHistory } from "@/lib/storage";
import { getMeaning } from "@/lib/tarot";
import type { ReadingSession } from "@/types/tarot";
import { LENORMAND_SPREAD_LABELS } from "@/lib/lenormand/layouts";
import { DECK_LABELS, SPREAD_LABELS } from "@/types/tarot";

function sessionSpreadLabel(session: ReadingSession): string {
  if (session.deck === "lenormand" && session.lenormandSpread) {
    return LENORMAND_SPREAD_LABELS[session.lenormandSpread];
  }
  if (session.spread && session.spread in SPREAD_LABELS) {
    return SPREAD_LABELS[session.spread as keyof typeof SPREAD_LABELS];
  }
  return "牌阵";
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingSession[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <ReadingLayout
      title="占卜记录"
      subtitle="你的过往解读保存在本地，不会上传至服务器。"
    >
      {history.length === 0 ? (
        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-muted">尚无记录</p>
          <motion.div className="mt-6">
            <AnimatedButton href="/reading">开始第一次占卜</AnimatedButton>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.ul className="space-y-4">
            {history.map((session, i) => (
              <motion.li
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl md:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs tracking-widest text-accent uppercase">
                    {session.deck && session.deck in DECK_LABELS
                      ? DECK_LABELS[session.deck]
                      : "维特塔罗"}
                    {" · "}
                    {sessionSpreadLabel(session)}
                  </span>
                  <time className="text-xs text-muted">
                    {new Date(session.createdAt).toLocaleString("zh-CN")}
                  </time>
                </div>
                {session.question && (
                  <p className="mb-3 text-sm text-frost">
                    「{session.question}」
                  </p>
                )}
                <ul className="space-y-2">
                  {session.cards.map((d) => {
                    const m = getMeaning(d.card, d.reversed);
                    return (
                      <li key={d.card.id} className="text-sm text-muted">
                        <span className="text-frost">{d.card.name}</span>
                        {d.position && (
                          <span className="mx-2 text-xs text-accent/80">
                            {d.position}
                          </span>
                        )}
                        {d.card.system === "waite" && (
                          <span className="text-xs">
                            {d.reversed ? "逆" : "正"}
                          </span>
                        )}
                        <span className="mx-2">—</span>
                        {m.summary.slice(0, 48)}…
                      </li>
                    );
                  })}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="mt-8 flex justify-center gap-4">
            <AnimatedButton href="/reading">新的占卜</AnimatedButton>
            <AnimatedButton variant="ghost" onClick={handleClear}>
              清空记录
            </AnimatedButton>
          </motion.div>
        </>
      )}
    </ReadingLayout>
  );
}
