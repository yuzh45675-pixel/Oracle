import waiteData from "@/data/waite-deck.json";
import lenormandData from "@/data/lenormand-deck.json";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import type {
  DeckType,
  DrawnCard,
  SpreadType,
  TarotCard,
  TarotMeaning,
} from "@/types/tarot";

export const WAITE_DECK: TarotCard[] = waiteData as TarotCard[];
export const LENORMAND_DECK: TarotCard[] = lenormandData as TarotCard[];

export function getDeck(deck: DeckType): TarotCard[] {
  return deck === "waite" ? WAITE_DECK : LENORMAND_DECK;
}

export function shuffleDeck<T>(array: T[]): T[] {
  const deck = [...array];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawRandomOrientation(deck: DeckType): boolean {
  if (deck === "lenormand") return false;
  return Math.random() < 0.5;
}

export function drawCards(
  spread: SpreadType,
  deckType: DeckType,
  excludeIds: string[] = []
): DrawnCard[] {
  const layout = getSpreadLayout(spread);
  const source = shuffleDeck(
    getDeck(deckType).filter((c) => !excludeIds.includes(c.id))
  );
  const selected = source.slice(0, layout.cardCount);

  return layout.slots.map((slot, index) => ({
    card: selected[index],
    reversed: drawRandomOrientation(deckType),
    position: slot.label,
    slotId: slot.id,
    isJumpCard: false,
  }));
}

export function getMeaning(
  card: TarotCard,
  reversed: boolean
): TarotMeaning {
  if (card.system === "lenormand") return card.upright;
  return reversed ? card.reversed : card.upright;
}

export function getCardById(id: string, deck?: DeckType): TarotCard | undefined {
  if (deck === "waite") return WAITE_DECK.find((c) => c.id === id);
  if (deck === "lenormand") return LENORMAND_DECK.find((c) => c.id === id);
  return WAITE_DECK.find((c) => c.id === id) ?? LENORMAND_DECK.find((c) => c.id === id);
}

export const TAROT_DECK = WAITE_DECK;
