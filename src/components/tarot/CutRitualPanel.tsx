"use client";

import { useState } from "react";
import { DeckScrollPicker } from "./DeckScrollPicker";
import { SwipeCutRitual } from "./SwipeCutRitual";
import type { TarotCard as TarotCardType } from "@/types/tarot";

type CutMode = "scroll" | "pile";

interface CutRitualPanelProps {
  spreadCardCount: number;
  pool: TarotCardType[];
  excludeIds?: string[];
  onComplete: (selection: number | string[]) => void;
}

export function CutRitualPanel({
  spreadCardCount,
  pool,
  excludeIds = [],
  onComplete,
}: CutRitualPanelProps) {
  const [mode, setMode] = useState<CutMode>("scroll");

  return (
    <div className="w-full">
      <div className="mx-auto mb-5 flex max-w-[min(100%,20rem)] justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 sm:max-w-md lg:max-w-lg lg:gap-3 lg:p-1.5">
        <button
          type="button"
          onClick={() => setMode("scroll")}
          className={`flex-1 rounded-full px-4 py-2 text-[10px] tracking-[0.16em] uppercase transition lg:px-5 lg:py-2.5 lg:text-xs ${
            mode === "scroll"
              ? "bg-accent/20 text-frost"
              : "text-muted hover:text-frost"
          }`}
        >
          滑动选牌
        </button>
        <button
          type="button"
          onClick={() => setMode("pile")}
          className={`flex-1 rounded-full px-4 py-2 text-[10px] tracking-[0.16em] uppercase transition lg:px-5 lg:py-2.5 lg:text-xs ${
            mode === "pile"
              ? "bg-accent/20 text-frost"
              : "text-muted hover:text-frost"
          }`}
        >
          选堆切牌
        </button>
      </div>

      {mode === "scroll" ? (
        <DeckScrollPicker
          pool={pool}
          pickCount={spreadCardCount}
          excludeIds={excludeIds}
          onConfirm={(ids) => onComplete(ids)}
        />
      ) : (
        <SwipeCutRitual
          spreadCardCount={spreadCardCount}
          onCutComplete={(pileIndex) => onComplete(pileIndex)}
        />
      )}
    </div>
  );
}
