import { LENORMAND_DECK, shuffleDeck } from "@/lib/tarot";
import { getLenormandLayout } from "@/lib/lenormand/layouts";
import type { DrawnCard } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

export function drawLenormandCards(
  spread: LenormandSpreadType,
  excludeIds: string[] = [],
  pool?: typeof LENORMAND_DECK
): DrawnCard[] {
  const layout = getLenormandLayout(spread);
  const source = shuffleDeck(
    (pool ?? LENORMAND_DECK).filter((c) => !excludeIds.includes(c.id))
  );
  const selected = source.slice(0, layout.cardCount);

  return layout.slots.map((slot, index) => {
    const card = selected[index];
    if (!card) {
      throw new Error(`雷诺曼牌阵 ${spread} 抽牌不足`);
    }
    return {
      card,
      reversed: false,
      position: slot.label,
      slotId: slot.id,
      isJumpCard: false,
    };
  });
}
