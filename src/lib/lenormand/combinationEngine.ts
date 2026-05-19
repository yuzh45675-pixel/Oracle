import type { DrawnCard, TarotCard } from "@/types/tarot";
import type { LenormandCombination, LenormandSpreadType } from "@/types/lenormand";
import { getTableauNeighbors } from "@/lib/lenormand/layouts";

/** 经典双牌组合（英名键，排序后查找） */
const PAIR_MEANINGS: Record<string, { title: string; summary: string }> = {
  "Heart-Ring": {
    title: "心 + 戒指",
    summary: "稳定的情感承诺、关系进入合约或婚姻阶段。",
  },
  "Fox-Book": {
    title: "狐狸 + 书",
    summary: "隐藏的信息、需要警惕的秘密或职场策略。",
  },
  "Rider-Letter": {
    title: "骑士 + 信",
    summary: "即将收到的消息、文书或书面通知。",
  },
  "Snake-Ring": {
    title: "蛇 + 戒指",
    summary: "复杂的关系承诺，或带有诱惑的合约。",
  },
  "Tower-Garden": {
    title: "塔 + 花园",
    summary: "机构、权威与公众场合的交集。",
  },
  "Bear-Fish": {
    title: "熊 + 鱼",
    summary: "财务上的力量与流动，大笔资金动向。",
  },
  "Crossroads-Ship": {
    title: "十字路口 + 船",
    summary: "与旅行或远方有关的抉择。",
  },
  "Mice-Heart": {
    title: "老鼠 + 心",
    summary: "情感上的损耗、担忧侵蚀关系。",
  },
  "Sun-Moon": {
    title: "太阳 + 月亮",
    summary: "公众成功与私下情绪、名声与直觉并存。",
  },
  "Anchor-Cross": {
    title: "锚 + 十字",
    summary: "长期的负担与责任，职业上的重压。",
  },
  "Child-Stars": {
    title: "孩子 + 星星",
    summary: "新的希望、小小的开端带来指引。",
  },
  "Whip-Birds": {
    title: "鞭 + 鸟",
    summary: "激烈的交谈、重复争论或多声部议论。",
  },
  "Coffin-Bouquet": {
    title: "棺材 + 花束",
    summary: "结束之后的礼物或社交上的缓和。",
  },
  "Key-Book": {
    title: "钥匙 + 书",
    summary: "解开秘密、找到重要答案。",
  },
  "Man-Woman": {
    title: "男人 + 女人",
    summary: "关系中的男女双方、问卜者与对象的互动。",
  },
};

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

function synthesizePair(a: TarotCard, b: TarotCard): LenormandCombination {
  const kw = [...a.keywords.slice(0, 2), ...b.keywords.slice(0, 2)];
  return {
    kind: "pair",
    cardIds: [a.id, b.id],
    title: `${a.name} + ${b.name}`,
    summary: `「${a.name}」与「${b.name}」并置：${kw.join("、")} 在同一叙事中相互作用。关注事件如何串联，而非各自象征。`,
  };
}

export function getPairCombination(
  a: TarotCard,
  b: TarotCard
): LenormandCombination {
  const hit = PAIR_MEANINGS[pairKey(a.nameEn, b.nameEn)];
  if (hit) {
    return {
      kind: "pair",
      cardIds: [a.id, b.id],
      title: hit.title,
      summary: hit.summary,
    };
  }
  return synthesizePair(a, b);
}

export function getTripleLineReading(cards: DrawnCard[]): LenormandCombination | null {
  if (cards.length < 3) return null;
  const [a, b, c] = cards.map((d) => d.card);
  const labels = cards.map((d) => d.position ?? "").join(" → ");
  return {
    kind: "triple",
    cardIds: [a.id, b.id, c.id],
    title: `三牌线性：${labels}`,
    summary: `从左至右阅读：${a.name} 引出 ${b.name}，最终指向 ${c.name}。重点在因果链与事件推进，而非单张牌义。`,
  };
}

export function getCrossCombinations(cards: DrawnCard[]): LenormandCombination[] {
  if (cards.length < 5) return [];
  const core = cards[0].card;
  const out: LenormandCombination[] = [];
  for (let i = 1; i < 5; i++) {
    const other = cards[i].card;
    const c = getPairCombination(core, other);
    out.push({
      ...c,
      kind: "adjacent",
      title: `核心 × ${cards[i].position ?? "方位"}：${c.title}`,
    });
  }
  return out;
}

export function getTableauAdjacentPairs(
  cards: DrawnCard[],
  focusIndex: number
): LenormandCombination[] {
  const neighbors = getTableauNeighbors(focusIndex);
  const focus = cards[focusIndex]?.card;
  if (!focus) return [];
  const out: LenormandCombination[] = [];
  for (const ni of neighbors) {
    const other = cards[ni]?.card;
    if (!other) continue;
    const c = getPairCombination(focus, other);
    out.push({
      ...c,
      kind: "adjacent",
      title: `邻位 ${focusIndex + 1}↔${ni + 1}：${c.title}`,
    });
  }
  return out;
}

export function buildLenormandCombinations(
  spread: LenormandSpreadType,
  cards: DrawnCard[]
): LenormandCombination[] {
  const valid = cards.filter((c) => c?.card?.id);
  if (valid.length === 0) return [];

  switch (spread) {
    case "daily":
      return [
        {
          kind: "line",
          cardIds: [valid[0].card.id],
          title: valid[0].card.name,
          summary: `${valid[0].card.upright.summary} 以当日事件为焦点理解此牌。`,
        },
      ];
    case "pair":
      if (valid.length >= 2) {
        return [getPairCombination(valid[0].card, valid[1].card)];
      }
      return [];
    case "line_time":
    case "line_cause": {
      const line = getTripleLineReading(valid);
      return line ? [line] : [];
    }
    case "cross":
      return getCrossCombinations(valid);
    case "tableau": {
      const pairs: LenormandCombination[] = [];
      for (let i = 0; i < Math.min(valid.length, 36); i++) {
        const adj = getTableauAdjacentPairs(valid, i);
        if (adj[0]) pairs.push(adj[0]);
      }
      return pairs.slice(0, 12);
    }
    default:
      return [];
  }
}
