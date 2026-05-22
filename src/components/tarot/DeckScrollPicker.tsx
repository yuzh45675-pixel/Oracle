"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TarotCard } from "./TarotCard";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import type { TarotCard as TarotCardType } from "@/types/tarot";

interface DeckScrollPickerProps {
  pool: TarotCardType[];
  pickCount: number;
  excludeIds?: string[];
  onConfirm: (pickedIds: string[]) => void;
}

function splitRows(cards: TarotCardType[]) {
  const mid = Math.ceil(cards.length / 2);
  return [cards.slice(0, mid), cards.slice(mid)] as const;
}

function ScrollRow({
  cards,
  selectedOrder,
  pickCount,
  onToggle,
}: {
  cards: TarotCardType[];
  selectedOrder: Map<string, number>;
  pickCount: number;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2.5 px-1 py-1">
        {cards.map((card) => {
          const order = selectedOrder.get(card.id);
          const selected = order !== undefined;
          const full = selectedOrder.size >= pickCount && !selected;

          return (
            <button
              key={card.id}
              type="button"
              disabled={full}
              onClick={() => onToggle(card.id)}
              className={`relative shrink-0 rounded-xl transition-transform active:scale-95 disabled:opacity-35 ${
                selected
                  ? "ring-2 ring-accent/70 ring-offset-2 ring-offset-void"
                  : "opacity-90 hover:opacity-100"
              }`}
              aria-pressed={selected}
              aria-label={card.name}
            >
              <TarotCard size="xs" interactive={false} />
              {selected && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-void shadow-[0_0_12px_rgba(155,140,255,0.45)]">
                  {order}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DeckScrollPicker({
  pool,
  pickCount,
  excludeIds = [],
  onConfirm,
}: DeckScrollPickerProps) {
  const { triggerBurst } = useParticleInteraction();
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  const available = useMemo(
    () => pool.filter((c) => !excludeIds.includes(c.id)),
    [pool, excludeIds],
  );

  const [topRow, bottomRow] = useMemo(
    () => splitRows(available),
    [available],
  );

  const selectedOrder = useMemo(() => {
    const map = new Map<string, number>();
    pickedIds.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [pickedIds]);

  const toggleCard = (id: string) => {
    setPickedIds((prev) => {
      const index = prev.indexOf(id);
      if (index >= 0) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= pickCount) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (pickedIds.length !== pickCount) return;
    triggerBurst();
    if (navigator.vibrate) navigator.vibrate([8, 20, 10]);
    onConfirm(pickedIds);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="mb-4 text-center text-xs leading-relaxed text-muted">
        全牌分为上下两行，左右滑动浏览
        <br />
        <span className="text-frost/80">
          轻触选牌 · 按选择顺序对应牌阵位置 · 选满 {pickCount} 张后确认
        </span>
      </p>

      <div className="space-y-3 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-md sm:p-4">
        <div>
          <p className="mb-2 px-1 text-[9px] tracking-[0.22em] text-muted/80 uppercase">
            上行 · {topRow.length} 张
          </p>
          <ScrollRow
            cards={topRow}
            selectedOrder={selectedOrder}
            pickCount={pickCount}
            onToggle={toggleCard}
          />
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div>
          <p className="mb-2 px-1 text-[9px] tracking-[0.22em] text-muted/80 uppercase">
            下行 · {bottomRow.length} 张
          </p>
          <ScrollRow
            cards={bottomRow}
            selectedOrder={selectedOrder}
            pickCount={pickCount}
            onToggle={toggleCard}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="text-[10px] tracking-[0.18em] text-muted/80 uppercase">
          已选 {pickedIds.length} / {pickCount}
        </p>
        <motion.button
          type="button"
          disabled={pickedIds.length !== pickCount}
          onClick={handleConfirm}
          className="rounded-full border border-accent/40 bg-accent/15 px-8 py-2.5 text-sm text-frost transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
          whileTap={{ scale: 0.98 }}
        >
          确认选牌
        </motion.button>
        {pickedIds.length > 0 && pickedIds.length < pickCount && (
          <button
            type="button"
            onClick={() => setPickedIds([])}
            className="text-[10px] text-muted hover:text-frost"
          >
            清空重选
          </button>
        )}
      </div>
    </div>
  );
}
