export interface SpreadCardSlot {
  id: string;
  label: string;
  position: { x: number; y: number };
  rotation: number;
  zIndex: number;
}

export interface SpreadLayoutConfig {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  viewport: { width: number; height: number };
  slots: SpreadCardSlot[];
}

const VW = 1000;
const VH = 720;
const CX = VW / 2;
const CY = VH / 2;

const COMPACT_CENTERED = ["single", "three", "five"] as const;

/** 将牌阵几何中心对齐视口正中（用于单牌/三牌/五牌） */
export function centerSlotsInViewport(
  slots: SpreadCardSlot[],
  vw: number,
  vh: number
): SpreadCardSlot[] {
  if (slots.length === 0) return slots;
  const xs = slots.map((s) => s.position.x);
  const ys = slots.map((s) => s.position.y);
  const gx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const gy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const dx = vw / 2 - gx;
  const dy = vh / 2 - gy;
  return slots.map((s) => ({
    ...s,
    position: { x: s.position.x + dx, y: s.position.y + dy },
  }));
}

function circleSlots(
  count: number,
  radius: number,
  labels: string[],
  startAngle = -Math.PI / 2
): SpreadCardSlot[] {
  return labels.map((label, i) => {
    const angle = startAngle + (i / count) * Math.PI * 2;
    return {
      id: `slot-${i}`,
      label,
      position: {
        x: CX + Math.cos(angle) * radius,
        y: CY + Math.sin(angle) * radius,
      },
      rotation: (angle * 180) / Math.PI + 90,
      zIndex: i + 1,
    };
  });
}

function starPoints(radius: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    pts.push({
      x: CX + Math.cos(angle) * radius,
      y: CY + Math.sin(angle) * radius,
    });
  }
  return pts;
}

/** 十字牌阵：中心 + 上/下/左/右四向（等距） */
function crossArmsSlots(
  labels: [string, string, string, string, string],
  arm = 165,
): SpreadCardSlot[] {
  return [
    {
      id: "slot-0",
      label: labels[0],
      position: { x: CX, y: CY },
      rotation: 0,
      zIndex: 3,
    },
    {
      id: "slot-1",
      label: labels[1],
      position: { x: CX, y: CY - arm },
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "slot-2",
      label: labels[2],
      position: { x: CX, y: CY + arm },
      rotation: 0,
      zIndex: 1,
    },
    {
      id: "slot-3",
      label: labels[3],
      position: { x: CX - arm, y: CY },
      rotation: -4,
      zIndex: 2,
    },
    {
      id: "slot-4",
      label: labels[4],
      position: { x: CX + arm, y: CY },
      rotation: 4,
      zIndex: 2,
    },
  ];
}

/**
 * 凯尔特十字（线下标准）：
 * 十字区 1–6：现况→交叉→下(基础)→左(近过去)→上(意识目标)→右(近未来)
 * 权杖区 7–10（自下而上）：自我→环境→希望/恐惧→结果
 */
function celticCrossSlots(): SpreadCardSlot[] {
  const crossX = 395;
  const crossY = CY;
  const arm = 168;
  const staffX = 735;
  const staffGap = 122;

  return [
    {
      id: "slot-0",
      label: "现况",
      position: { x: crossX, y: crossY },
      rotation: 0,
      zIndex: 3,
    },
    {
      id: "slot-1",
      label: "挑战",
      position: { x: crossX, y: crossY },
      rotation: 90,
      zIndex: 5,
    },
    {
      id: "slot-2",
      label: "根基",
      position: { x: crossX, y: crossY + arm },
      rotation: 0,
      zIndex: 1,
    },
    {
      id: "slot-3",
      label: "近过去",
      position: { x: crossX - arm, y: crossY },
      rotation: -3,
      zIndex: 2,
    },
    {
      id: "slot-4",
      label: "意识目标",
      position: { x: crossX, y: crossY - arm },
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "slot-5",
      label: "近未来",
      position: { x: crossX + arm, y: crossY },
      rotation: 3,
      zIndex: 2,
    },
    {
      id: "slot-6",
      label: "自我",
      position: { x: staffX, y: crossY + staffGap * 1.4 },
      rotation: 0,
      zIndex: 1,
    },
    {
      id: "slot-7",
      label: "环境",
      position: { x: staffX, y: crossY + staffGap * 0.45 },
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "slot-8",
      label: "希望/恐惧",
      position: { x: staffX, y: crossY - staffGap * 0.45 },
      rotation: 0,
      zIndex: 2,
    },
    {
      id: "slot-9",
      label: "结果",
      position: { x: staffX, y: crossY - staffGap * 1.4 },
      rotation: 0,
      zIndex: 3,
    },
  ];
}

/** 马蹄铁阵：左下→弧顶→右下，第4张在弧顶 */
function horseshoeSlots(labels: string[]): SpreadCardSlot[] {
  const cx = CX;
  const cy = CY + 30;
  const halfW = 295;
  const depth = 205;
  const coords = [
    { x: cx - halfW, y: cy + depth * 0.52 },
    { x: cx - halfW * 0.66, y: cy + depth * 0.18 },
    { x: cx - halfW * 0.33, y: cy - depth * 0.12 },
    { x: cx, y: cy - depth * 0.42 },
    { x: cx + halfW * 0.33, y: cy - depth * 0.12 },
    { x: cx + halfW * 0.66, y: cy + depth * 0.18 },
    { x: cx + halfW, y: cy + depth * 0.52 },
  ];

  return labels.map((label, i) => ({
    id: `slot-${i}`,
    label,
    position: coords[i]!,
    rotation: (i - 3) * 2.5,
    zIndex: i + 1,
  }));
}

/** 决策牌阵：上(隐藏) · 中左右(A/B) · 中(建议) · 下(结果) */
function decisionSlots(): SpreadCardSlot[] {
  const armX = 210;
  const armY = 155;
  return [
    {
      id: "slot-0",
      label: "隐藏因素",
      position: { x: CX, y: CY - armY },
      rotation: 0,
      zIndex: 1,
    },
    {
      id: "slot-1",
      label: "选项 A",
      position: { x: CX - armX, y: CY - 20 },
      rotation: -8,
      zIndex: 2,
    },
    {
      id: "slot-2",
      label: "选项 B",
      position: { x: CX + armX, y: CY - 20 },
      rotation: 8,
      zIndex: 2,
    },
    {
      id: "slot-3",
      label: "建议",
      position: { x: CX, y: CY + 35 },
      rotation: 0,
      zIndex: 4,
    },
    {
      id: "slot-4",
      label: "可能结果",
      position: { x: CX, y: CY + armY + 25 },
      rotation: 0,
      zIndex: 3,
    },
  ];
}

/** 关系牌阵：上(阻碍) · 中(你-核心-对方) · 下(走向) */
function relationshipSlots(): SpreadCardSlot[] {
  const arm = 165;
  const side = 230;
  return [
    {
      id: "slot-0",
      label: "你",
      position: { x: CX - side, y: CY },
      rotation: -6,
      zIndex: 2,
    },
    {
      id: "slot-1",
      label: "对方",
      position: { x: CX + side, y: CY },
      rotation: 6,
      zIndex: 2,
    },
    {
      id: "slot-2",
      label: "关系核心",
      position: { x: CX, y: CY },
      rotation: 0,
      zIndex: 4,
    },
    {
      id: "slot-3",
      label: "阻碍",
      position: { x: CX, y: CY - arm },
      rotation: 0,
      zIndex: 1,
    },
    {
      id: "slot-4",
      label: "走向",
      position: { x: CX, y: CY + arm },
      rotation: 0,
      zIndex: 1,
    },
  ];
}

export const SPREAD_LAYOUTS = {
  single: {
    id: "single",
    name: "单牌占卜",
    description: "聚焦当下，一张牌照亮此刻最需要看见的答案。",
    cardCount: 1,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "当下",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 2,
      },
    ],
  },

  three: {
    id: "three",
    name: "三牌时光",
    description: "过去、现在与未来——以时间之流解读生命轨迹。",
    cardCount: 3,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "过去",
        position: { x: CX - 240, y: CY },
        rotation: -4,
        zIndex: 1,
      },
      {
        id: "slot-1",
        label: "现在",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 3,
      },
      {
        id: "slot-2",
        label: "未来",
        position: { x: CX + 240, y: CY },
        rotation: 4,
        zIndex: 2,
      },
    ],
  },

  five: {
    id: "five",
    name: "五牌洞察",
    description: "现状、挑战、潜意识、建议与结果，层层展开。",
    cardCount: 5,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "现状",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 3,
      },
      {
        id: "slot-1",
        label: "挑战",
        position: { x: CX, y: CY },
        rotation: 90,
        zIndex: 4,
      },
      {
        id: "slot-2",
        label: "潜意识",
        position: { x: CX, y: CY + 165 },
        rotation: 0,
        zIndex: 1,
      },
      {
        id: "slot-3",
        label: "建议",
        position: { x: CX - 165, y: CY },
        rotation: -5,
        zIndex: 2,
      },
      {
        id: "slot-4",
        label: "结果",
        position: { x: CX + 165, y: CY },
        rotation: 5,
        zIndex: 2,
      },
    ],
  },

  relationship: {
    id: "relationship",
    name: "关系牌阵",
    description: "你、对方、关系核心、阻碍与走向，照见联结。",
    cardCount: 5,
    viewport: { width: VW, height: VH },
    slots: relationshipSlots(),
  },

  horseshoe: {
    id: "horseshoe",
    name: "马蹄铁阵",
    description: "七张牌呈马蹄弧形，从隐因到建议与结果。",
    cardCount: 7,
    viewport: { width: VW, height: VH },
    slots: horseshoeSlots([
      "过去",
      "现在",
      "隐藏因素",
      "障碍",
      "环境",
      "建议",
      "结果",
    ]),
  },

  celtic: {
    id: "celtic",
    name: "凯尔特十字",
    description: "经典十牌阵：中央十字与右侧纵列，深度剖析处境。",
    cardCount: 10,
    viewport: { width: VW, height: VH },
    slots: celticCrossSlots(),
  },

  cross: {
    id: "cross",
    name: "十字牌阵",
    description: "中心为核心，四向展开，看清局势的四个面向。",
    cardCount: 5,
    viewport: { width: VW, height: VH },
    slots: crossArmsSlots(["核心", "上方", "下方", "左方", "右方"]),
  },

  star: {
    id: "star",
    name: "星形牌阵",
    description: "五角星布局，中心为本质，五角为五个面向。",
    cardCount: 6,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "本质",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 6,
      },
      ...["灵感", "情感", "行动", "物质", "灵性"].map((label, i) => {
        const pt = starPoints(260)[i];
        return {
          id: `slot-${i + 1}`,
          label,
          position: pt,
          rotation: (i * 72 - 90) * 0.15,
          zIndex: i + 1,
        };
      }),
    ],
  },

  decision: {
    id: "decision",
    name: "决策牌阵",
    description: "两条路径与结果对照，辅助抉择。",
    cardCount: 5,
    viewport: { width: VW, height: VH },
    slots: decisionSlots(),
  },

  moon_cycle: {
    id: "moon_cycle",
    name: "月相牌阵",
    description: "八个月相位置，照见周期与节律。",
    cardCount: 8,
    viewport: { width: VW, height: VH },
    slots: circleSlots(
      8,
      265,
      ["新月", "峨眉月", "上弦", "盈凸", "满月", "亏凸", "下弦", "残月"],
      -Math.PI / 2,
    ),
  },

  twelve_house: {
    id: "twelve_house",
    name: "年度十二宫",
    description: "十二张牌环绕中心，对应黄道十二宫领域。",
    cardCount: 12,
    viewport: { width: VW, height: VH },
    slots: circleSlots(12, 310, [
      "自我",
      "财富",
      "沟通",
      "家庭",
      "创造",
      "健康",
      "伴侣",
      "转化",
      "远行",
      "事业",
      "社群",
      "潜意识",
    ]),
  },

  soul_journey: {
    id: "soul_journey",
    name: "灵魂探索",
    description: "九站旅程，从起点到内在召唤。",
    cardCount: 9,
    viewport: { width: VW, height: 1100 },
    slots: [
      { id: "s0", label: "起点", position: { x: CX, y: 140 }, rotation: 0, zIndex: 1 },
      { id: "s1", label: "过去印记", position: { x: CX - 200, y: 260 }, rotation: -12, zIndex: 2 },
      { id: "s2", label: "当下课题", position: { x: CX + 200, y: 380 }, rotation: 10, zIndex: 2 },
      { id: "s3", label: "内在资源", position: { x: CX - 180, y: 500 }, rotation: -8, zIndex: 3 },
      { id: "s4", label: "阴影", position: { x: CX, y: 580 }, rotation: 0, zIndex: 4 },
      { id: "s5", label: "疗愈", position: { x: CX + 190, y: 660 }, rotation: 8, zIndex: 3 },
      { id: "s6", label: "指引", position: { x: CX - 160, y: 780 }, rotation: -6, zIndex: 2 },
      { id: "s7", label: "召唤", position: { x: CX + 150, y: 900 }, rotation: 6, zIndex: 2 },
      { id: "s8", label: "整合", position: { x: CX, y: 1000 }, rotation: 0, zIndex: 5 },
    ],
  },
} as const satisfies Record<string, SpreadLayoutConfig>;

export type SpreadType = keyof typeof SPREAD_LAYOUTS;

export const SPREAD_LIST: SpreadLayoutConfig[] = Object.values(
  SPREAD_LAYOUTS
) as SpreadLayoutConfig[];

export function getSpreadLayout(spread: SpreadType): SpreadLayoutConfig {
  const base = SPREAD_LAYOUTS[spread] as SpreadLayoutConfig;
  if ((COMPACT_CENTERED as readonly string[]).includes(spread)) {
    return {
      ...base,
      slots: centerSlotsInViewport(
        base.slots,
        base.viewport.width,
        base.viewport.height
      ),
    };
  }
  return base;
}

export function getSpreadLabels(spread: SpreadType): string[] {
  return SPREAD_LAYOUTS[spread].slots.map((s) => s.label);
}
