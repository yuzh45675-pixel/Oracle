import type { LenormandCombination } from "@/types/lenormand";
import type { DeckType, DrawnCard } from "@/types/tarot";

/** 仅提供牌位与牌名，避免附带牌义摘要诱导模型做百科式解读 */
function formatDrawnCardLine(deck: DeckType, drawn: DrawnCard): string {
  const pos = drawn.position ? `（${drawn.position}）` : "";
  if (deck === "waite") {
    return `- ${pos}${drawn.card.name}${drawn.reversed ? "·逆位" : "·正位"}`;
  }
  return `- ${pos}${drawn.card.name}`;
}

const READING_INSTRUCTION =
  "请先整体感受这组牌的情绪氛围与关系动力，再像真人塔罗师一样慢慢读出来。不要逐张百科式解释，不要编号罗列，不要模板鸡汤。全文 3～5 个自然段、约 450～750 字；勿用 # 与 *。";

const FOLLOW_UP_INSTRUCTION =
  "请保持真人咨询语气：先回应追问，再融入原牌阵整体感受。不要逐张百科，不要编号罗列。2～4 个自然段；勿用 # 与 *。";

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
      : `【用户问题】（未填写，请依牌阵整体感受与关系动力解读）`,
    "",
    "【抽到的牌】（牌位 + 牌名；请先整体观察，勿逐张查字典）",
  ];

  for (const drawn of cards) {
    lines.push(formatDrawnCardLine(deck, drawn));
  }

  if (jumpCard?.card) {
    lines.push(
      "",
      `【跳牌】${jumpCard.card.name}${deck === "waite" && jumpCard.reversed ? "·逆位" : ""}`,
    );
  }

  if (combinations?.length) {
    lines.push("", "【牌际组合】（供关系叙事参考，勿逐条机械解释）");
    for (const c of combinations) {
      lines.push(`- ${c.title}：${c.summary}`);
    }
  }

  lines.push("", READING_INSTRUCTION);

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
  }

  lines.push("", FOLLOW_UP_INSTRUCTION);

  return lines.join("\n");
}
