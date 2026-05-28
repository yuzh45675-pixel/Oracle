"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReadingLayout } from "@/components/tarot/ReadingLayout";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ReadingExportButton } from "@/components/reading/ReadingExportButton";
import { clearHistory, loadHistory } from "@/lib/storage";
import {
  getSessionDeckLabel,
  getSessionSpreadLabel,
} from "@/lib/session-labels";
import type { ReadingSession } from "@/types/tarot";

function HistoryEntry({ session, index }: { session: ReadingSession; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const readings =
    session.cardReadings ??
    session.cards.map((d) => ({
      cardId: d.card.id,
      cardName: d.card.name,
      cardNameEn: d.card.nameEn,
      image: d.card.image,
      position: d.position,
      reversed: d.reversed,
      summary: "",
      detail: "",
    }));

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 p-5 text-left md:p-6"
      >
        <div className="min-w-0 flex-1">
          <span className="text-xs tracking-widest text-accent uppercase">
            {getSessionDeckLabel(session)} · {getSessionSpreadLabel(session)}
          </span>
          {session.question && (
            <p className="mt-2 truncate text-sm text-frost">「{session.question}」</p>
          )}
          <p className="mt-2 text-xs text-muted">
            {session.aiInterpretation
              ? session.aiInterpretation.slice(0, 56) +
                (session.aiInterpretation.length > 56 ? "…" : "")
              : readings[0]?.summary
                ? readings[0].summary.slice(0, 56) + "…"
                : `${readings.length} 张牌`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <time className="block text-xs text-muted">
            {new Date(session.createdAt).toLocaleString("zh-CN")}
          </time>
          <span className="mt-2 block text-[10px] text-accent/80">
            {open ? "收起" : "展开"}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="space-y-6 p-5 md:p-6">
              <div className="flex flex-wrap gap-2">
                {readings.map((r) => (
                  <div
                    key={r.cardId}
                    className="flex w-[72px] flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.cardName}
                      className="h-16 w-11 rounded object-contain bg-[#f5f0e8]"
                    />
                    <p className="mt-1.5 line-clamp-2 text-center text-[9px] leading-tight text-muted">
                      {r.position ? `${r.position} · ` : ""}
                      {r.cardName}
                    </p>
                  </div>
                ))}
              </div>

              {session.aiInterpretation && (
                <section>
                  <p className="mb-2 text-[10px] tracking-widest text-accent uppercase">
                    AI 解读
                  </p>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-frost/95">
                      {session.aiInterpretation}
                    </p>
                  </div>
                </section>
              )}

              {session.combinations && session.combinations.length > 0 && (
                <section>
                  <p className="mb-2 text-[10px] tracking-widest text-accent uppercase">
                    组合解读
                  </p>
                  <div className="space-y-3">
                    {session.combinations.map((c, i) => (
                      <article
                        key={`${c.title}-${i}`}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <h4 className="font-display text-base text-frost">{c.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {c.summary}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {readings.some((r) => r.summary || r.detail) && (
                <section>
                  <p className="mb-2 text-[10px] tracking-widest text-accent uppercase">
                    牌义详解
                  </p>
                  <div className="space-y-4">
                    {readings.map((r) => (
                      <article
                        key={`reading-${r.cardId}`}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <h4 className="text-sm font-medium text-frost">
                          {r.position && (
                            <span className="mr-2 text-accent/90">{r.position}</span>
                          )}
                          {r.cardName}
                          {session.deck !== "lenormand" && r.reversed !== undefined && (
                            <span className="ml-2 text-xs text-muted">
                              {r.reversed ? "逆位" : "正位"}
                            </span>
                          )}
                        </h4>
                        {r.summary && (
                          <p className="mt-2 text-sm leading-relaxed text-frost/90">
                            {r.summary}
                          </p>
                        )}
                        {r.detail && (
                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {r.detail}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {session.aiFollowUps && session.aiFollowUps.length > 0 && (
                <section>
                  <p className="mb-2 text-[10px] tracking-widest text-accent uppercase">
                    追问记录
                  </p>
                  <div className="space-y-3">
                    {session.aiFollowUps.map((fu, i) => (
                      <article
                        key={`fu-${i}`}
                        className="rounded-xl border border-white/[0.06] bg-black/20 p-4"
                      >
                        <p className="text-xs text-accent/90">问：{fu.question}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                          {fu.answer}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <ReadingExportButton session={session} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
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
      subtitle="解读结果保存在本地，含 AI 神谕与牌义详解，可下载为分享长图。"
      wide
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
              <HistoryEntry key={session.id} session={session} index={i} />
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
