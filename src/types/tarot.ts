import {
  SPREAD_LAYOUTS,
  SPREAD_LIST,
  type SpreadLayoutConfig,
  type SpreadType,
} from "@/lib/spreadLayouts";

export type { SpreadType };

export type Arcana = "major" | "minor" | "lenormand";
export type Suit = "wands" | "cups" | "swords" | "pentacles" | "none";
export type DeckType = "waite" | "lenormand";
export type CardSystem = "waite" | "lenormand";

export type RitualPhase = "idle" | "shuffling" | "cutting" | "spread" | "complete";

export interface TarotMeaning {
  summary: string;
  detail: string;
}

export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  upright: TarotMeaning;
  reversed: TarotMeaning;
  description: string;
  keywords: string[];
  image: string;
  suit: Suit;
  arcana: Arcana;
  system: CardSystem;
  number?: number;
}

export interface SpreadInfo {
  type: SpreadType;
  title: string;
  desc: string;
  cardCount: number;
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position?: string;
  slotId?: string;
  isJumpCard?: boolean;
}

export interface ReadingSession {
  id: string;
  deck?: DeckType;
  /** 维特塔罗牌阵 */
  spread?: SpreadType;
  /** 雷诺曼牌阵 */
  lenormandSpread?: import("@/types/lenormand").LenormandSpreadType;
  cards: DrawnCard[];
  jumpCard?: DrawnCard | null;
  combinations?: import("@/types/lenormand").LenormandCombination[];
  createdAt: string;
  question?: string;
}

export const SPREADS: SpreadInfo[] = SPREAD_LIST.map((l) => ({
  type: l.id as SpreadType,
  title: l.name,
  desc: l.description,
  cardCount: l.cardCount,
}));

export const SPREAD_POSITIONS: Record<SpreadType, string[]> = Object.fromEntries(
  Object.entries(SPREAD_LAYOUTS).map(([k, v]) => [
    k,
    v.slots.map((s) => s.label),
  ])
) as Record<SpreadType, string[]>;

export const SPREAD_LABELS: Record<SpreadType, string> = Object.fromEntries(
  Object.entries(SPREAD_LAYOUTS).map(([k, v]) => [k, v.name])
) as Record<SpreadType, string>;

export const DECK_LABELS: Record<DeckType, string> = {
  waite: "维特塔罗（78张）",
  lenormand: "雷诺曼（36张）",
};

export const FLIP_GUIDANCE = [
  "深呼吸，聚焦你当下的问题……",
  "让思绪沉淀，感受你真正想问的事……",
  "在翻开牌之前，与内心的疑问对视片刻……",
  "放慢呼吸，把意念轻轻放在牌面上……",
  "不必用力，只需保持开放与诚实……",
  "若有问题，请在心中默念，然后翻开……",
  "信任第一直觉，它比分析更接近答案……",
  "感受身体，脚底扎根，再翻开下一张……",
  "允许不确定存在，牌会替你照亮一角……",
  "把期待放下，只看见此刻需要看见的……",
];

