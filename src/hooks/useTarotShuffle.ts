"use client";

import { useCallback, useRef, useState } from "react";
import { drawRandomOrientation, getDeck, shuffleDeck } from "@/lib/tarot";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import type { DeckType, DrawnCard, SpreadType, TarotCard } from "@/types/tarot";

const JUMP_CHANCE = 0.1;
const SHUFFLE_MS = 3200;

export function useTarotShuffle() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [jumpCard, setJumpCard] = useState<DrawnCard | null>(null);
  const [showJumpNotice, setShowJumpNotice] = useState(false);
  const shuffledPoolRef = useRef<TarotCard[]>([]);

  const runShuffle = useCallback(
    async (deckType: DeckType, spread: SpreadType): Promise<boolean> => {
      setIsShuffling(true);
      setShowJumpNotice(false);

      const layout = getSpreadLayout(spread);
      const pool = shuffleDeck(getDeck(deckType));
      shuffledPoolRef.current = pool;

      const willJump = Math.random() < JUMP_CHANCE;
      const jumpDelay = willJump ? 1200 + Math.random() * 800 : SHUFFLE_MS;

      await new Promise((r) => setTimeout(r, jumpDelay));

      if (willJump && pool.length > 0) {
        const jumpIndex = Math.floor(Math.random() * Math.min(pool.length, 12));
        const card = pool[jumpIndex];
        setJumpCard({
          card,
          reversed: drawRandomOrientation(deckType),
          position: "跳牌",
          slotId: "jump",
          isJumpCard: true,
        });
        setShowJumpNotice(true);
        await new Promise((r) => setTimeout(r, 1400));
      }

      await new Promise((r) =>
        setTimeout(r, Math.max(0, SHUFFLE_MS - jumpDelay))
      );

      setIsShuffling(false);
      return willJump;
    },
    []
  );

  const drawFromPool = useCallback(
    (spread: SpreadType, deckType: DeckType): DrawnCard[] => {
      const layout = getSpreadLayout(spread);
      const pool = shuffledPoolRef.current.length
        ? [...shuffledPoolRef.current]
        : shuffleDeck(getDeck(deckType));

      const jumpId = jumpCard?.card.id;
      const filtered = jumpId ? pool.filter((c) => c.id !== jumpId) : pool;
      let selected = filtered.slice(0, layout.cardCount);
      if (selected.length < layout.cardCount) {
        const extra = shuffleDeck(
          getDeck(deckType).filter(
            (c) =>
              (!jumpId || c.id !== jumpId) &&
              !selected.some((s) => s.id === c.id)
          )
        );
        selected = [...selected, ...extra].slice(0, layout.cardCount);
      }

      return layout.slots.map((slot, index) => {
        const card = selected[index];
        if (!card) {
          throw new Error(`牌阵 ${spread} 抽牌不足，请重试`);
        }
        return {
          card,
          reversed: drawRandomOrientation(deckType),
          position: slot.label,
          slotId: slot.id,
          isJumpCard: false,
        };
      });
    },
    [jumpCard]
  );

  const resetShuffle = useCallback(() => {
    setJumpCard(null);
    setShowJumpNotice(false);
    shuffledPoolRef.current = [];
  }, []);

  return {
    isShuffling,
    jumpCard,
    showJumpNotice,
    runShuffle,
    drawFromPool,
    resetShuffle,
  };
}
