import { getLenormandLayout } from "@/lib/lenormand/layouts";
import type { DrawnCard } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

const FLIP_ORDERS: Record<LenormandSpreadType, number[] | "all"> = {
  daily: [0],
  pair: [0, 1],
  line_time: [0, 1, 2],
  line_cause: [0, 1, 2],
  cross: [0, 3, 4, 1, 2],
  tableau: "all",
};

export function getLenormandExpectedCount(spread: LenormandSpreadType): number {
  return getLenormandLayout(spread).cardCount;
}

export function getLenormandFlipOrder(spread: LenormandSpreadType): number[] {
  const layout = getLenormandLayout(spread);
  const order = FLIP_ORDERS[spread];
  if (order === "all") {
    return Array.from({ length: layout.cardCount }, (_, i) => i);
  }
  return order;
}

export function getLenormandActiveIndex(
  spread: LenormandSpreadType,
  revealedCount: number
): number {
  const order = getLenormandFlipOrder(spread);
  return order[revealedCount] ?? revealedCount;
}

export function getLenormandRevealPrompt(
  spread: LenormandSpreadType,
  cards: DrawnCard[],
  revealedCount: number
): string {
  const total = cards.length;
  if (spread === "tableau") {
    return revealedCount >= total
      ? "桌布已全部展开，可拖动查看并点选牌位。"
      : "正在铺开桌布……";
  }
  const activeIndex = getLenormandActiveIndex(spread, revealedCount);
  if (revealedCount >= total) {
    return "牌面已揭示，可查看组合解读。";
  }
  const label =
    cards[activeIndex]?.position ??
    getLenormandLayout(spread).slots[activeIndex]?.label ??
    "此位置";
  return `请翻开「${label}」（${revealedCount + 1}/${total}）`;
}

export function orderLenormandCardsForReading(
  spread: LenormandSpreadType,
  cards: DrawnCard[]
): DrawnCard[] {
  const order = getLenormandFlipOrder(spread);
  return order
    .map((i) => cards[i])
    .filter((c): c is DrawnCard => Boolean(c?.card?.id));
}
