import { getMeaning } from "@/lib/tarot";
import type { LenormandCombination } from "@/types/lenormand";
import type { DeckType, DrawnCard } from "@/types/tarot";

function formatDrawnCardLine(deck: DeckType, drawn: DrawnCard): string {
  const pos = drawn.position ? `（${drawn.position}）` : "";
  if (deck === "waite") {
    const m = getMeaning(drawn.card, drawn.reversed);
    return `- ${pos}${drawn.card.name}${drawn.reversed ? "·逆位" : "·正位"}：${m.summary}；关键词：${drawn.card.keywords.join("、")}`;
  }
  return `- ${pos}${drawn.card.name}：${drawn.card.upright.summary}；关键词：${drawn.card.keywords.join("、")}`;
}

export function buildReadingContextMessage(options: {
  deck: DeckType;
  spreadTitle: string;
  question?: string;
  cards: DrawnCard[];
  jumpCard?: DrawnCard | null;
  combinations?: LenormandCombination[];
}): string {
  const { deck, spreadTitle, question, cards, jumpCard, combinations } =
    options;

  const lines: string[] = [
    `【牌组】${deck === "waite" ? "维特塔罗" : "雷诺曼"}`,
    `【牌阵】${spreadTitle}`,
    question?.trim()
      ? `【用户问题】${question.trim()}`
      : `【用户问题】（未填写，请依牌面整体解读）`,
    "",
    "【抽到的牌】",
  ];

  for (const drawn of cards) {
    lines.push(formatDrawnCardLine(deck, drawn));
  }

  if (jumpCard?.card) {
    const m = getMeaning(jumpCard.card, jumpCard.reversed);
    lines.push(
      "",
      `【跳牌】${jumpCard.card.name}：${m.summary}`,
    );
  }

  if (combinations?.length) {
    lines.push("", "【牌际组合】");
    for (const c of combinations) {
      lines.push(`- ${c.title}：${c.summary}`);
    }
  }

  lines.push(
    "",
    "请严格按系统提示：八个维度全部覆盖且合并叙述；全文 3～5 个自然段、约 400～700 字；判断题先写结论（是/否/不确定）；勿用 # 与 *；勿写成八段逐条解读。",
  );

  return lines.join("\n");
}

export function buildFollowUpMessage(options: {
  deck: DeckType;
  spreadTitle: string;
  originalQuestion?: string;
  followUpQuestion: string;
  originalCards: DrawnCard[];
  supplementCards: DrawnCard[];
}): string {
  const {
    deck,
    spreadTitle,
    originalQuestion,
    followUpQuestion,
    originalCards,
    supplementCards,
  } = options;

  const lines: string[] = [
    "【类型】追问",
    `【原牌阵】${spreadTitle}`,
    originalQuestion?.trim()
      ? `【原问题】${originalQuestion.trim()}`
      : "【原问题】（未填写）",
    "",
    "【原牌阵牌面】",
    ...originalCards.map((d) => formatDrawnCardLine(deck, d)),
    "",
    `【本次追问】${followUpQuestion.trim()}`,
  ];

  if (supplementCards.length > 0) {
    lines.push("", "【追问补牌】");
    for (const d of supplementCards) {
      lines.push(formatDrawnCardLine(deck, d));
    }
    lines.push(
      "",
      "请先结合补牌回答本次追问，再将补牌与原牌阵、原问题综合解读。仍遵守系统提示（判断题先给结论；2～4 段；段落长短有主次；勿用 # 与 *）。",
    );
  } else {
    lines.push(
      "",
      "请在不抽新牌的前提下，结合原牌阵与原问题回答本次追问。仍遵守系统提示（判断题先给结论；2～4 段；段落长短有主次；勿用 # 与 *）。",
    );
  }

  return lines.join("\n");
}
