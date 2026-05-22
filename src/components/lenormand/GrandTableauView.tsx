"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LenormandCard } from "./LenormandCard";
import { LenormandTable } from "./LenormandTable";
import {
  useLenormandSpreadLayout,
  useLenormandTableSize,
} from "@/hooks/useLenormandSpreadLayout";
import { getLenormandLayout } from "@/lib/lenormand/layouts";
import { getTableauAdjacentPairs } from "@/lib/lenormand/combinationEngine";
import type { DrawnCard } from "@/types/tarot";

interface GrandTableauViewProps {
  cards: DrawnCard[];
  flipped: boolean[];
  revealedCount: number;
  onReveal: () => void;
}

export function GrandTableauView({
  cards,
  flipped,
  revealedCount,
  onReveal,
}: GrandTableauViewProps) {
  const layoutMeta = getLenormandLayout("tableau");
  const { containerSize, tableHeight, setContainerRef } = useLenormandTableSize(
    layoutMeta.viewport.height,
    "tableau"
  );
  const { scaledSlots } = useLenormandSpreadLayout(
    "tableau",
    containerSize.width,
    containerSize.height
  );

  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const allRevealed = revealedCount >= cards.length;
  const displayCards = cards.slice(0, 36);

  const neighborHighlights = useMemo(() => {
    const idx = focusIndex ?? hoverIndex;
    if (idx == null) return new Set<number>();
    const pairs = getTableauAdjacentPairs(displayCards, idx);
    const set = new Set<number>([idx]);
    pairs.forEach((p) => {
      p.cardIds.forEach((id) => {
        const i = displayCards.findIndex((d) => d.card.id === id);
        if (i >= 0) set.add(i);
      });
    });
    return set;
  }, [focusIndex, hoverIndex, displayCards]);

  const focusPairs =
    focusIndex != null ? getTableauAdjacentPairs(displayCards, focusIndex) : [];

  return (
    <div className="w-full">
      {!allRevealed && (
        <p className="mb-4 text-center text-xs text-muted">
          正在铺开 36 张桌布……
          <button
            type="button"
            className="ml-2 underline text-[#c4b8a8]"
            onClick={onReveal}
          >
            立即展开
          </button>
        </p>
      )}

      <LenormandTable
        className="w-full"
        style={{ height: tableHeight, minHeight: 400 }}
        enablePan
      >
        <div ref={setContainerRef} className="relative h-full w-full">
          {displayCards.map((drawn, i) => {
            const slot = scaledSlots[i];
            if (!slot || !drawn?.card?.id) return null;
            const isFlipped = flipped[i] || allRevealed;
            const highlighted = neighborHighlights.has(i);
            const dimmed =
              neighborHighlights.size > 0 && !highlighted && focusIndex != null;

            return (
              <motion.div
                key={drawn.card.id}
                className="absolute left-0 top-0"
                style={{
                  left: slot.x,
                  top: slot.y,
                  zIndex: highlighted ? 100 : slot.zIndex,
                  transform: "translate(-50%, -50%)",
                  opacity: dimmed ? 0.35 : 1,
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => setFocusIndex(focusIndex === i ? null : i)}
                whileHover={{ scale: 1.12, zIndex: 150 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <div className="relative inline-block">
                <LenormandCard
                  card={drawn.card}
                  flipped={isFlipped}
                  settled
                  size="sm"
                  interactive={false}
                  highlighted={highlighted}
                />
                <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-[#6a6358]">
                  {i + 1}
                </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </LenormandTable>

      <p className="mt-3 text-center text-[10px] text-[#6a6358]">
        拖动桌面查看 · 点击牌位高亮邻位组合 · 悬停放大
      </p>

      <AnimatePresence>
        {focusIndex != null && focusPairs.length > 0 && (
          <motion.div
            className="mx-auto mt-6 max-w-lg rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-[10px] tracking-widest text-muted uppercase">
              邻位关系 · 第 {focusIndex + 1} 张
            </p>
            <ul className="mt-2 space-y-2">
              {focusPairs.slice(0, 4).map((c) => (
                <li key={c.title} className="text-sm text-frost">
                  <span className="font-medium">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {c.summary}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
