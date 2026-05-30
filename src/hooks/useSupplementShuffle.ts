"use client";

import { useCallback, useRef, useState } from "react";
import { drawRandomOrientation, getDeck, shuffleDeck } from "@/lib/tarot";
import type { DeckType, DrawnCard, TarotCard } from "@/types/tarot";

const SHUFFLE_MS = 2400;

export function useSupplementShuffle() {
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffledPoolRef = useRef<TarotCard[]>([]);

  const runShuffle = useCallback(async (deckType: DeckType, excludeIds: string[]) => {
    setIsShuffling(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const pool = shuffleDeck(
      getDeck(deckType).filter((c) => !excludeIds.includes(c.id)),
    );
    shuffledPoolRef.current = pool;
    await new Promise((r) => setTimeout(r, SHUFFLE_MS));
    setIsShuffling(false);
  }, []);

  const drawFromPool = useCallback(
    (deckType: DeckType, count: number, excludeIds: string[]): DrawnCard[] => {
      const pool = shuffledPoolRef.current.length
        ? [...shuffledPoolRef.current]
        : shuffleDeck(getDeck(deckType).filter((c) => !excludeIds.includes(c.id)));

      return pool.slice(0, count).map((card, index) => ({
        card,
        reversed: drawRandomOrientation(deckType),
        position: `补牌 ${index + 1}`,
        isJumpCard: false,
      }));
    },
    [],
  );

  const resetShuffle = useCallback(() => {
    shuffledPoolRef.current = [];
    setIsShuffling(false);
  }, []);

  return { isShuffling, runShuffle, drawFromPool, resetShuffle };
}
