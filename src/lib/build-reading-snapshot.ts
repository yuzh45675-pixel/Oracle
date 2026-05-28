import { getMeaning } from "@/lib/tarot";
import type { CardReadingSnapshot, DrawnCard } from "@/types/tarot";

export function buildCardReadingSnapshots(
  cards: DrawnCard[],
): CardReadingSnapshot[] {
  return cards.map((drawn) => {
    const meaning = getMeaning(drawn.card, drawn.reversed);
    return {
      cardId: drawn.card.id,
      cardName: drawn.card.name,
      cardNameEn: drawn.card.nameEn,
      image: drawn.card.image,
      position: drawn.position,
      reversed: drawn.reversed,
      summary: meaning.summary,
      detail: meaning.detail,
    };
  });
}
