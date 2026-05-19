/**
 * Generates waite-deck.json (78) and lenormand-deck.json (36)
 */
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const majors = JSON.parse(
  readFileSync(join(dataDir, "tarot-cards.json"), "utf8")
);

const SUIT_ZH = {
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
};

const RANK_ZH = {
  ace: "王牌",
  "2": "二",
  "3": "三",
  "4": "四",
  "5": "五",
  "6": "六",
  "7": "七",
  "8": "八",
  "9": "九",
  "10": "十",
  page: "侍从",
  knight: "骑士",
  queen: "皇后",
  king: "国王",
};

const RANK_EN = {
  ace: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  page: "Page",
  knight: "Knight",
  queen: "Queen",
  king: "King",
};

const SUIT_THEMES = {
  wands: { element: "火", theme: "行动、热情与创造", upright: "能量正在流动，适合采取主动。", reversed: "冲动或倦怠让你偏离方向，先稳住节奏。" },
  cups: { element: "水", theme: "情感、关系与直觉", upright: "心灵层面正在打开，倾听感受。", reversed: "情绪起伏或逃避需要被看见与接纳。" },
  swords: { element: "风", theme: "思维、决断与真相", upright: "清晰的思考有助于做出选择。", reversed: "过度分析或言语冲突可能遮蔽真相。" },
  pentacles: { element: "土", theme: "物质、身体与长期建设", upright: "务实与耐心将带来可见的积累。", reversed: "资源焦虑或停滞提醒重新规划。" },
};

const RANK_NUANCE = {
  ace: "新的开端与潜能种子",
  "2": "平衡、选择与伙伴关系",
  "3": "扩展、表达与初步成果",
  "4": "稳定、结构与短暂休憩",
  "5": "张力、冲突或考验",
  "6": "回顾、疗愈与调和",
  "7": "坚持、策略与内在力量",
  "8": "加速、技艺与专注",
  "9": "接近完成时的独处与整合",
  "10": "周期圆满或负担的顶点",
  page: "好奇、学习与讯息",
  knight: "推进、追求与行动方式",
  queen: "滋养、感受与内在成熟",
  king: "掌控、责任与外在权威",
};

const RANKS = [
  "ace", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "page", "knight", "queen", "king",
];

function minorCard(suit, rank) {
  const suitZh = SUIT_ZH[suit];
  const rankZh = RANK_ZH[rank];
  const name = `${suitZh}${rankZh}`;
  const nameEn = `${RANK_EN[rank]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
  const st = SUIT_THEMES[suit];
  const nuance = RANK_NUANCE[rank];
  const id = `minor-${suit}-${rank}`;
  const num = rank === "ace" ? 1 : rank === "page" ? 11 : rank === "knight" ? 12 : rank === "queen" ? 13 : rank === "king" ? 14 : parseInt(rank, 10);

  return {
    id,
    name,
    nameEn,
    arcana: "minor",
    suit,
    number: num,
    system: "waite",
    image: `/cards/${id}.png`,
    keywords: [st.element, suitZh, rankZh],
    description: `${suitZh}牌组的${rankZh}：${st.theme}。${nuance}。`,
    upright: {
      summary: `${name}（正位）：${st.upright}`,
      detail: `正位${name}在${st.theme}的脉络中强调「${nuance}」。请结合牌阵位置，观察此事如何在你生活中展开。`,
    },
    reversed: {
      summary: `${name}（逆位）：${st.reversed}`,
      detail: `逆位${name}提示能量阻滞或过度：${nuance}的一面需要调整。放慢脚步，辨认是外在阻碍还是内在模式。`,
    },
  };
}

const minors = [];
for (const suit of ["wands", "cups", "swords", "pentacles"]) {
  for (const rank of RANKS) {
    minors.push(minorCard(suit, rank));
  }
}

const waiteDeck = [
  ...majors.map((c) => ({ ...c, system: "waite" })),
  ...minors,
];

const LENORMAND = [
  [1, "Rider", "骑士", "消息、访客、迅速的变化"],
  [2, "Clover", "三叶草", "小幸运、短暂机遇、轻松"],
  [3, "Ship", "船", "旅行、距离、探索"],
  [4, "House", "房屋", "家庭、安全、根基"],
  [5, "Tree", "树", "健康、成长、缓慢发展"],
  [6, "Clouds", "云", "困惑、不明朗、犹豫"],
  [7, "Snake", "蛇", "复杂、诱惑、迂回"],
  [8, "Coffin", "棺材", "结束、转化、沉寂"],
  [9, "Bouquet", "花束", "礼物、美好、社交愉悦"],
  [10, "Scythe", "镰刀", "决断、切割、突然"],
  [11, "Whip", "鞭", "冲突、重复、张力"],
  [12, "Birds", "鸟", "交谈、焦虑、多方声音"],
  [13, "Child", "孩子", "开端、纯真、小事"],
  [14, "Fox", "狐狸", "谨慎、职场、策略"],
  [15, "Bear", "熊", "力量、保护、权威人物"],
  [16, "Stars", "星星", "希望、灵感、指引"],
  [17, "Stork", "鹳", "改变、迁移、更新"],
  [18, "Dog", "狗", "忠诚、朋友、信任"],
  [19, "Tower", "塔", "机构、边界、孤独"],
  [20, "Garden", "花园", "公众、社交圈、展示"],
  [21, "Mountain", "山", "障碍、延迟、考验"],
  [22, "Crossroads", "十字路口", "选择、方向、分叉"],
  [23, "Mice", "老鼠", "损耗、担忧、细节流失"],
  [24, "Heart", "心", "爱、核心、情感"],
  [25, "Ring", "戒指", "承诺、合约、循环"],
  [26, "Book", "书", "秘密、学习、未揭示"],
  [27, "Letter", "信", "文件、讯息、书面"],
  [28, "Man", "男人", "男性、主动方、问卜者（男）"],
  [29, "Woman", "女人", "女性、被动方、问卜者（女）"],
  [30, "Lily", "百合", "成熟、平和、长期"],
  [31, "Sun", "太阳", "成功、活力、明朗"],
  [32, "Moon", "月亮", "直觉、名声、周期"],
  [33, "Key", "钥匙", "解答、重要、开启"],
  [34, "Fish", "鱼", "金钱、流动、丰盛"],
  [35, "Anchor", "锚", "稳定、职业、执着"],
  [36, "Cross", "十字", "负担、命运、考验"],
];

const lenormandDeck = LENORMAND.map(([num, nameEn, name, theme]) => ({
  id: `lenormand-${String(num).padStart(2, "0")}`,
  name,
  nameEn,
  arcana: "lenormand",
  suit: "none",
  number: num,
  system: "lenormand",
  image: `/cards/lenormand-${String(num).padStart(2, "0")}.svg`,
  keywords: theme.split("、"),
  description: `雷诺曼 ${num} 号牌：${name}（${nameEn}）— ${theme}。`,
  upright: {
    summary: `${name}：${theme.split("、")[0]}的能量正在显现。`,
    detail: `在雷诺曼体系中，${name}常关联「${theme}」。请结合牌阵位置与左右邻牌，读取组合叙事，而非单牌孤立解释。`,
  },
  reversed: {
    summary: `${name}：阻滞或延迟了相关主题。`,
    detail: `此牌能量受阻或需要更多耐心。关注${theme}中被忽略的层面，并观察邻近牌如何修饰其含义。`,
  },
}));

writeFileSync(
  join(dataDir, "waite-deck.json"),
  JSON.stringify(waiteDeck, null, 2),
  "utf8"
);
writeFileSync(
  join(dataDir, "lenormand-deck.json"),
  JSON.stringify(lenormandDeck, null, 2),
  "utf8"
);

console.log(`Waite: ${waiteDeck.length} cards`);
console.log(`Lenormand: ${lenormandDeck.length} cards`);
