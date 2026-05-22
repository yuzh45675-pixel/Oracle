"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  buildFollowUpMessage,
  buildReadingContextMessage,
} from "@/lib/build-reading-prompt";
import {
  betaUnlockReading,
  createPayment,
  devCompletePayment,
  fetchPaymentStatus,
} from "@/lib/auth-client";
import {
  fetchChatHealth,
  sendChatRequest,
  type ChatMessage,
} from "@/lib/ai-chat";
import { useAuth } from "@/context/AuthContext";
import { SupplementDrawFlow } from "@/components/reading/SupplementDrawFlow";
import type { LenormandCombination } from "@/types/lenormand";
import type { DeckType, DrawnCard } from "@/types/tarot";

type FollowUpPath = "choose" | "plain" | "drawing" | "ready";

type DisplayMessage =
  | { role: "assistant"; content: string }
  | {
      role: "user";
      kind: "spread" | "followup";
      content: string;
      supplementCards?: DrawnCard[];
    };

type AiOraclePanelProps = {
  deck: DeckType;
  spreadTitle: string;
  question?: string;
  cards: DrawnCard[];
  jumpCard?: DrawnCard | null;
  combinations?: LenormandCombination[];
};

export function AiOraclePanel({
  deck,
  spreadTitle,
  question,
  cards,
  jumpCard,
  combinations,
}: AiOraclePanelProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [followUpPath, setFollowUpPath] = useState<FollowUpPath>("choose");
  const [pendingSupplement, setPendingSupplement] = useState<DrawnCard[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [started, setStarted] = useState(false);
  const pendingRetry = useRef<{
    messages: ChatMessage[];
    display: DisplayMessage[];
  } | null>(null);
  const { user, openAuth, refreshUser } = useAuth();

  const excludeCardIds = useMemo(() => {
    const ids = new Set<string>();
    for (const d of cards) ids.add(d.card.id);
    if (jumpCard?.card) ids.add(jumpCard.card.id);
    for (const m of displayMessages) {
      if (m.role === "user" && m.supplementCards) {
        for (const s of m.supplementCards) ids.add(s.card.id);
      }
    }
    if (pendingSupplement) {
      for (const s of pendingSupplement) ids.add(s.card.id);
    }
    return [...ids];
  }, [cards, jumpCard, displayMessages, pendingSupplement]);

  const contextMessage = buildReadingContextMessage({
    deck,
    spreadTitle,
    question,
    cards,
    jumpCard,
    combinations,
  });

  const runChat = useCallback(
    async (nextMessages: ChatMessage[], nextDisplay: DisplayMessage[]) => {
      if (!user) {
        openAuth();
        return;
      }
      setLoading(true);
      setError(null);
      setPaymentRequired(false);
      try {
        await fetchChatHealth();
        const result = await sendChatRequest({ messages: nextMessages });
        setChatMessages([
          ...nextMessages,
          { role: "assistant", content: result.reply },
        ]);
        setDisplayMessages([
          ...nextDisplay,
          { role: "assistant", content: result.reply },
        ]);
        setStarted(true);
        await refreshUser();
      } catch (e) {
        const err = e as Error & { code?: string; status?: number };
        if (err.code === "PAYMENT_REQUIRED" || err.status === 402) {
          pendingRetry.current = {
            messages: nextMessages,
            display: nextDisplay,
          };
          setPaymentRequired(true);
          setError(null);
        } else {
          setError(
            err.message ||
              "解读失败，请确认已运行 npm run server 并配置 .env",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [user, openAuth, refreshUser],
  );

  const retryPendingChat = useCallback(async () => {
    const pending = pendingRetry.current;
    if (!pending) return;
    pendingRetry.current = null;
    await runChat(pending.messages, pending.display);
  }, [runChat]);

  const handleBetaUnlock = useCallback(async () => {
    setPaying(true);
    setError(null);
    try {
      await betaUnlockReading();
      await refreshUser();
      setPaymentRequired(false);
      await retryPendingChat();
    } catch (e) {
      setError(e instanceof Error ? e.message : "解锁失败");
    } finally {
      setPaying(false);
    }
  }, [refreshUser, retryPendingChat]);

  const handlePay = useCallback(async () => {
    setPaying(true);
    setError(null);
    try {
      const payment = await createPayment();
      if (payment.devMode) {
        await devCompletePayment(payment.orderId);
        await refreshUser();
        setPaymentRequired(false);
        await retryPendingChat();
        return;
      }
      if (payment.payUrl) {
        window.open(payment.payUrl, "_blank", "noopener,noreferrer");
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const status = await fetchPaymentStatus(payment.orderId);
          if (status.status === "paid") {
            await refreshUser();
            setPaymentRequired(false);
            await retryPendingChat();
            return;
          }
        }
        setError("支付确认超时，若已付款请刷新页面后重试");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "支付失败");
    } finally {
      setPaying(false);
    }
  }, [refreshUser, retryPendingChat]);

  const handleStartInterpretation = () => {
    if (!user) {
      openAuth();
      return;
    }
    void runChat(
      [{ role: "user", content: contextMessage }],
      [{ role: "user", kind: "spread", content: "" }],
    );
  };

  const resetFollowUpFlow = () => {
    setFollowUpPath("choose");
    setPendingSupplement(null);
    setFollowUp("");
  };

  const handleFollowUp = () => {
    const text = followUp.trim();
    if (!text || loading) return;

    const supplement = pendingSupplement ?? [];

    const payload = buildFollowUpMessage({
      deck,
      spreadTitle,
      originalQuestion: question,
      followUpQuestion: text,
      originalCards: cards,
      supplementCards: supplement,
    });

    const nextChat: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: payload },
    ];
    const nextDisplay: DisplayMessage[] = [
      ...displayMessages,
      {
        role: "user",
        kind: "followup",
        content: text,
        supplementCards: supplement.length ? supplement : undefined,
      },
    ];

    setFollowUp("");
    setPendingSupplement(null);
    setFollowUpPath("choose");
    void runChat(nextChat, nextDisplay);
  };

  const canSendFollowUp =
    followUpPath === "plain" ||
    (followUpPath === "ready" && pendingSupplement !== null);

  return (
    <motion.section
      className="mt-10 rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/10 to-transparent p-6 backdrop-blur-xl md:p-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-accent uppercase">
            DeepSeek 神谕
          </p>
          <h2 className="mt-1 font-display text-xl text-frost">AI 解读</h2>
        </div>
        {!started && !loading && user && (
          <button
            type="button"
            onClick={handleStartInterpretation}
            className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2 text-sm text-frost transition hover:bg-accent/25"
          >
            {question ? "针对你的问题解读" : "生成牌阵解读"}
          </button>
        )}
        {!user && !loading && (
          <button
            type="button"
            onClick={openAuth}
            className="rounded-full border border-accent/40 bg-accent/15 px-5 py-2 text-sm text-frost"
          >
            登录后解读
          </button>
        )}
      </div>

      {user && (
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-muted">
          今日免费解读：剩余 {user.freeRemaining ?? 0} / {user.dailyFreeLimit ?? 3} 次
          {user.credits > 0 && ` · 已解锁 ${user.credits} 次`}
          {!user.betaMode && ` · 超出后每次 ¥${user.readingPrice.toFixed(2)}`}
          {user.betaMode && user.freeRemaining === 0 && user.credits === 0 && (
            <span className="text-accent/80"> · 内测阶段超出免费次数后可免费继续</span>
          )}
        </p>
      )}

      {paymentRequired && user && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-4">
          {user.betaMode !== false ? (
            <>
              <p className="font-display text-base text-amber-50">支付确认</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
                内测阶段服务<strong className="font-medium text-amber-50">免费</strong>
                ，正式收款功能上线后将按次计费。点击下方按钮即可继续本次 AI 解读。
              </p>
              <button
                type="button"
                disabled={paying || loading}
                onClick={() => void handleBetaUnlock()}
                className="mt-4 w-full rounded-xl border border-amber-400/50 bg-amber-500/15 py-2.5 text-sm text-amber-50 transition hover:bg-amber-500/25 disabled:opacity-50"
              >
                {paying || loading ? "正在生成解读…" : "继续解读（内测免费）"}
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-amber-100">需要购买 1 次解读额度</p>
          <button
            type="button"
            disabled={paying}
            onClick={() => void handlePay()}
            className="rounded-full border border-amber-400/50 px-4 py-1.5 text-xs text-amber-50 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {paying ? "处理中…" : `支付宝支付 ¥${user.readingPrice.toFixed(2)}`}
          </button>
            </div>
          )}
        </div>
      )}

      {question && (
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-muted">
          <span className="text-accent/90">你的问题：</span>
          {question}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
          <span className="mt-2 block text-xs text-red-200/70">
            请先运行 <code className="text-red-100">npm run server</code>
            ，并在项目根目录 .env 中设置 DEEPSEEK_API_KEY
          </span>
        </p>
      )}

      {loading && (
        <p className="mb-4 animate-pulse text-sm text-muted">
          正在读牌…
        </p>
      )}

      <AnimatePresence>
        {displayMessages.length > 0 && (
          <motion.ul
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {displayMessages.map((msg, i) => (
              <li
                key={`${msg.role}-${i}`}
                className={
                  msg.role === "assistant"
                    ? "rounded-xl border border-white/[0.06] bg-white/[0.04] p-4"
                    : "rounded-xl border border-white/[0.04] bg-black/20 px-4 py-3 text-sm"
                }
              >
                {msg.role === "assistant" ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-frost/95">
                    {msg.content}
                  </p>
                ) : (
                  <>
                    <span className="text-xs tracking-widest text-accent uppercase">
                      {msg.kind === "spread" ? "牌阵信息" : "你的追问"}
                    </span>
                    {msg.kind === "followup" && (
                      <>
                        <p className="mt-2 text-frost">{msg.content}</p>
                        {msg.supplementCards && msg.supplementCards.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.supplementCards.map((d) => (
                              <div
                                key={d.card.id}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={d.card.image}
                                  alt={d.card.name}
                                  className="h-12 w-8 rounded object-contain bg-[#f5f0e8]"
                                />
                                <span className="text-xs text-frost">
                                  {d.card.name}
                                  {deck === "waite" && d.reversed ? "·逆" : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {started && (
        <motion.div
          className="mt-6 border-t border-white/[0.06] pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <label className="mb-3 block text-xs tracking-widest text-muted uppercase">
            继续追问
          </label>

          {followUpPath === "choose" && (
            <div className="mb-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setFollowUpPath("plain")}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm text-frost transition hover:border-accent/40"
              >
                不抽牌，直接追问
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setFollowUpPath("drawing")}
                className="rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm text-frost transition hover:border-accent/50"
              >
                先抽补牌再追问
              </button>
            </div>
          )}

          {followUpPath === "drawing" && (
            <motion.div className="mb-4">
              <SupplementDrawFlow
                deck={deck}
                excludeCardIds={excludeCardIds}
                onComplete={(drawn) => {
                  setPendingSupplement(drawn);
                  setFollowUpPath("ready");
                }}
                onCancel={resetFollowUpFlow}
              />
            </motion.div>
          )}

          {followUpPath === "ready" && pendingSupplement && (
            <motion.div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
              <p className="mb-2 text-xs text-accent/90">已抽取的补牌</p>
              <div className="flex flex-wrap gap-2">
                {pendingSupplement.map((d) => (
                  <div
                    key={d.card.id}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-2 py-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.card.image}
                      alt={d.card.name}
                      className="h-10 w-7 rounded object-contain bg-[#f5f0e8]"
                    />
                    <span className="text-xs text-frost">{d.card.name}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingSupplement(null);
                  setFollowUpPath("drawing");
                }}
                className="mt-2 text-xs text-muted hover:text-frost"
              >
                重新抽牌
              </button>
            </motion.div>
          )}

          {canSendFollowUp && (
            <>
              {followUpPath === "plain" && (
                <button
                  type="button"
                  onClick={resetFollowUpFlow}
                  className="mb-2 text-xs text-muted hover:text-frost"
                >
                  返回选择追问方式
                </button>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="输入你的追问…"
                  rows={2}
                  disabled={loading}
                  className="min-h-[3rem] flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-frost placeholder:text-muted/50 outline-none focus:border-accent/30 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFollowUp();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleFollowUp}
                  disabled={loading || !followUp.trim()}
                  className="shrink-0 rounded-xl border border-accent/40 bg-accent/15 px-6 py-3 text-sm text-frost disabled:opacity-40 sm:self-end"
                >
                  发送
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}
