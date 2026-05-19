"use client";

import { useCallback, useRef, useState } from "react";
import { drawLenormandCards } from "@/lib/lenormand/draw";
import { getLenormandCardCount } from "@/lib/lenormand/layouts";
import { LENORMAND_DECK, shuffleDeck } from "@/lib/tarot";
import type { DrawnCard, TarotCard } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

const JUMP_CHANCE = 0.1;
const SHUFFLE_MS = 1800;

export function useLenormandShuffle() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [jumpCard, setJumpCard] = useState<DrawnCard | null>(null);
  const [showJumpNotice, setShowJumpNotice] = useState(false);
  const shuffledPoolRef = useRef<TarotCard[]>([]);

  const runShuffle = useCallback(
    async (spread: LenormandSpreadType): Promise<boolean> => {
      setIsShuffling(true);
      setShowJumpNotice(false);
      setJumpCard(null);

      const pool = shuffleDeck(LENORMAND_DECK);
      shuffledPoolRef.current = pool;

      const willJump = Math.random() < JUMP_CHANCE;
      const jumpDelay = willJump ? 700 + Math.random() * 500 : SHUFFLE_MS;

      await new Promise((r) => setTimeout(r, jumpDelay));

      if (willJump && pool.length > 0) {
        const jumpIndex = Math.floor(Math.random() * Math.min(pool.length, 10));
        const card = pool[jumpIndex];
        setJumpCard({
          card,
          reversed: false,
          position: "掉牌",
          slotId: "jump",
          isJumpCard: true,
        });
        setShowJumpNotice(true);
        await new Promise((r) => setTimeout(r, 900));
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
    (spread: LenormandSpreadType): DrawnCard[] => {
      const count = getLenormandCardCount(spread);
      const jumpId = jumpCard?.card.id;
      const pool = shuffledPoolRef.current.length
        ? [...shuffledPoolRef.current]
        : shuffleDeck(LENORMAND_DECK);
      const filtered = jumpId ? pool.filter((c) => c.id !== jumpId) : pool;

      if (filtered.length >= count) {
        return drawLenormandCards(spread, jumpId ? [jumpId] : [], filtered);
      }

      return drawLenormandCards(
        spread,
        jumpId ? [jumpId] : [],
        shuffleDeck(LENORMAND_DECK)
      );
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
