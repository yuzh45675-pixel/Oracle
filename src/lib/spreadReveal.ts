import { getSpreadLayout } from "@/lib/spreadLayouts";
import type { DrawnCard, SpreadType } from "@/types/tarot";

/** 各牌阵标准翻牌/解读顺序（槽位下标） */
export const SPREAD_FLIP_ORDERS: Record<SpreadType, number[]> = {
  single: [0],
  three: [0, 1, 2],
  five: [0, 1, 2, 3, 4],
  relationship: [2, 0, 1, 3, 4],
  horseshoe: [0, 1, 2, 3, 4, 5, 6],
  celtic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  cross: [0, 1, 2, 3, 4],
  star: [0, 1, 2, 3, 4, 5],
  decision: [0, 1, 2, 3, 4],
  moon_cycle: [0, 1, 2, 3, 4, 5, 6, 7],
  twelve_house: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  soul_journey: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

export function getExpectedCardCount(spread: SpreadType): number {
  return getSpreadLayout(spread).cardCount;
}

/** 获取牌阵翻牌顺序（槽位下标） */
export function getFlipOrder(spread: SpreadType): number[] {
  const layout = getSpreadLayout(spread);
  const order = SPREAD_FLIP_ORDERS[spread];
  if (order?.length === layout.cardCount) return [...order];
  return Array.from({ length: layout.cardCount }, (_, i) => i);
}

/** 当前应翻开的牌在 cards 数组中的下标 */
export function getActiveCardIndex(
  spread: SpreadType,
  revealedCount: number
): number {
  const order = getFlipOrder(spread);
  return order[revealedCount] ?? revealedCount;
}

/** 翻牌引导文案 */
export function getRevealPrompt(
  spread: SpreadType,
  cards: DrawnCard[],
  revealedCount: number
): string {
  const layout = getSpreadLayout(spread);
  const total = cards.length;
  const activeIndex = getActiveCardIndex(spread, revealedCount);

  if (revealedCount >= total) {
    return "全部牌面已揭示，可查看解读。";
  }

  const card = cards[activeIndex];
  const label = card?.position ?? layout.slots[activeIndex]?.label ?? "此位置";
  const step = revealedCount + 1;

  if (spread === "celtic" && revealedCount === 1) {
    return `凯尔特十字：请翻开横向交叉的「${label}」（${step}/${total}）`;
  }

  if (spread === "celtic" && revealedCount === 0) {
    return `凯尔特十字：请先翻开中央的「${label}」（${step}/${total}）`;
  }

  return `请翻开「${label}」（第 ${step} 张，共 ${total} 张）`;
}

/** 按解读顺序排列牌面（用于结果页） */
export function orderCardsForReading(
  spread: SpreadType,
  cards: DrawnCard[]
): DrawnCard[] {
  const order = getFlipOrder(spread);
  return order
    .map((i) => cards[i])
    .filter((c): c is DrawnCard => Boolean(c?.card?.id));
}

export function validateDrawnCards(cards: DrawnCard[]): DrawnCard[] {
  return cards.filter((c) => c?.card?.id && c.card.name);
}
