import { LENORMAND_SPREAD_LABELS } from "@/lib/lenormand/layouts";
import { DECK_LABELS, SPREAD_LABELS, type ReadingSession } from "@/types/tarot";

export function getSessionSpreadLabel(session: ReadingSession): string {
  if (session.deck === "lenormand" && session.lenormandSpread) {
    return LENORMAND_SPREAD_LABELS[session.lenormandSpread];
  }
  if (session.spread && session.spread in SPREAD_LABELS) {
    return SPREAD_LABELS[session.spread];
  }
  return "牌阵";
}

export function getSessionDeckLabel(session: ReadingSession): string {
  if (session.deck && session.deck in DECK_LABELS) {
    return DECK_LABELS[session.deck];
  }
  return "维特塔罗";
}
