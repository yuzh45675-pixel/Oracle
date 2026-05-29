"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDeck } from "@/lib/tarot";
import type { DeckType, DrawnCard } from "@/types/tarot";

interface ManualCardPickerProps {
  deck: DeckType;
  onConfirm: (cards: DrawnCard[]) => void;
  onClose: () => void;
}

function faceSrc(image: string) {
  return image.split("?")[0] ?? image;
}

/**
 * 直接解读：展开整副牌面，用户勾选线下真实抽到的牌（塔罗可选正/逆位），
 * 按勾选顺序交给 AI 解读。
 */
export function ManualCardPicker({
  deck,
  onConfirm,
  onClose,
}: ManualCardPickerProps) {
  const isTarot = deck === "waite";
  const cards = useMemo(() => getDeck(deck), [deck]);

  // 勾选顺序：cardId -> 第几张（从 1 开始）
  const [order, setOrder] = useState<string[]>([]);
  // 塔罗逆位：cardId -> true 表示逆位
  const [reversedMap, setReversedMap] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setOrder((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleReversed = (id: string) => {
    setReversedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearAll = () => {
    setOrder([]);
    setReversedMap({});
  };

  const handleConfirm = () => {
    if (order.length === 0) return;
    const cardMap = new Map(cards.map((c) => [c.id, c]));
    const drawn: DrawnCard[] = order
      .map((id, i) => {
        const card = cardMap.get(id);
        if (!card) return null;
        return {
          card,
          reversed: isTarot ? Boolean(reversedMap[id]) : false,
          position: `第 ${i + 1} 张`,
          isJumpCard: false,
        } as DrawnCard;
      })
      .filter((c): c is DrawnCard => c !== null);
    onConfirm(drawn);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-void/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 顶部栏 */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-8">
          <div>
            <p className="text-[10px] tracking-widest text-accent uppercase">
              直接解读
            </p>
            <h2 className="font-display text-lg text-frost">
              选择你抽到的牌
            </h2>
            <p className="text-xs text-muted">
              {isTarot
                ? "按线下抽到的顺序点选 · 点「正/逆」切换正逆位"
                : "按线下抽到的顺序点选"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="shrink-0 rounded-full border border-white/[0.12] px-3 py-1.5 text-xs text-muted hover:text-frost"
          >
            关闭
          </button>
        </div>

        {/* 牌面网格 */}
        <div className="flex-1 overflow-y-auto px-3 py-4 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {cards.map((card) => {
              const idx = order.indexOf(card.id);
              const selected = idx >= 0;
              const reversed = isTarot && Boolean(reversedMap[card.id]);
              return (
                <div key={card.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    className={`relative aspect-[2/3] overflow-hidden rounded-lg border transition-all ${
                      selected
                        ? "border-accent/70 shadow-glow"
                        : "border-white/[0.08] opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={faceSrc(card.image)}
                      alt={card.name}
                      loading="lazy"
                      className={`h-full w-full bg-[#f5f0e8] object-contain transition-transform ${
                        reversed ? "rotate-180" : ""
                      }`}
                    />
                    {selected && (
                      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-void">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                  <p className="mt-1 truncate text-center text-[10px] text-muted">
                    {card.name}
                  </p>
                  {selected && isTarot && (
                    <button
                      type="button"
                      onClick={() => toggleReversed(card.id)}
                      className={`mt-1 rounded-md border px-1.5 py-0.5 text-[10px] transition ${
                        reversed
                          ? "border-accent/50 bg-accent/15 text-accent"
                          : "border-white/[0.12] text-muted hover:text-frost"
                      }`}
                    >
                      {reversed ? "逆位" : "正位"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部确认栏 */}
        <div className="shrink-0 border-t border-white/[0.08] bg-void/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="text-xs text-muted">
              已选 <span className="text-frost">{order.length}</span> 张
              {order.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-3 underline-offset-4 hover:text-frost hover:underline"
                >
                  清空
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={order.length === 0}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-void transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              用 AI 解读{order.length > 0 ? ` · ${order.length} 张` : ""}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
