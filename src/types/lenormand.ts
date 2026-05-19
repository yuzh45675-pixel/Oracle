import type { DrawnCard, TarotCard } from "@/types/tarot";

export type ReadingSystem = "tarot" | "lenormand";

export type LenormandSpreadType =
  | "daily"
  | "pair"
  | "line_time"
  | "line_cause"
  | "cross"
  | "tableau";

export interface LenormandSpreadInfo {
  type: LenormandSpreadType;
  title: string;
  desc: string;
  cardCount: number;
}

export interface LenormandCombination {
  kind: "pair" | "triple" | "adjacent" | "line";
  cardIds: string[];
  title: string;
  summary: string;
}

export interface LenormandReadingSession {
  id: string;
  system: "lenormand";
  spread: LenormandSpreadType;
  cards: DrawnCard[];
  jumpCard?: DrawnCard | null;
  combinations: LenormandCombination[];
  createdAt: string;
  question?: string;
}

export type { TarotCard, DrawnCard };
