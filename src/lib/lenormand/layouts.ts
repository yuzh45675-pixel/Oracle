import type { SpreadCardSlot, SpreadLayoutConfig } from "@/lib/spreadLayouts";
import { centerSlotsInViewport } from "@/lib/spreadLayouts";
import type { LenormandSpreadType } from "@/types/lenormand";

const VW = 1000;
const VH = 720;
const CX = VW / 2;
const CY = VH / 2;

function gridSlots(
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  labels?: string[]
): SpreadCardSlot[] {
  const slots: SpreadCardSlot[] = [];
  const totalW = (cols - 1) * cellW;
  const totalH = (rows - 1) * cellH;
  const startX = CX - totalW / 2;
  const startY = CY - totalH / 2;
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        id: `slot-${n}`,
        label: labels?.[n] ?? String(n + 1),
        position: { x: startX + c * cellW, y: startY + r * cellH },
        rotation: 0,
        zIndex: n + 1,
      });
      n++;
    }
  }
  return slots;
}

const LENORMAND_LAYOUTS: Record<LenormandSpreadType, SpreadLayoutConfig> = {
  daily: {
    id: "daily",
    name: "单张抽牌",
    description: "Daily Draw — 聚焦当下一件事。",
    cardCount: 1,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "今日讯息",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 2,
      },
    ],
  },

  pair: {
    id: "pair",
    name: "双牌组合",
    description: "两张牌的关系叙事，而非单牌象征。",
    cardCount: 2,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "左牌",
        position: { x: CX - 160, y: CY },
        rotation: -2,
        zIndex: 1,
      },
      {
        id: "slot-1",
        label: "右牌",
        position: { x: CX + 160, y: CY },
        rotation: 2,
        zIndex: 2,
      },
    ],
  },

  line_time: {
    id: "line_time",
    name: "三牌时光线",
    description: "过去 → 现在 → 未来，从左至右阅读。",
    cardCount: 3,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "过去",
        position: { x: CX - 220, y: CY },
        rotation: -3,
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
        position: { x: CX + 220, y: CY },
        rotation: 3,
        zIndex: 2,
      },
    ],
  },

  line_cause: {
    id: "line_cause",
    name: "三牌因果线",
    description: "原因 → 过程 → 结果，从左至右阅读。",
    cardCount: 3,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "原因",
        position: { x: CX - 220, y: CY },
        rotation: -3,
        zIndex: 1,
      },
      {
        id: "slot-1",
        label: "过程",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 3,
      },
      {
        id: "slot-2",
        label: "结果",
        position: { x: CX + 220, y: CY },
        rotation: 3,
        zIndex: 2,
      },
    ],
  },

  cross: {
    id: "cross",
    name: "五牌十字",
    description: "中央为核心问题，上下左右为影响因素。",
    cardCount: 5,
    viewport: { width: VW, height: VH },
    slots: [
      {
        id: "slot-0",
        label: "核心",
        position: { x: CX, y: CY },
        rotation: 0,
        zIndex: 4,
      },
      {
        id: "slot-1",
        label: "上方",
        position: { x: CX, y: CY - 150 },
        rotation: 0,
        zIndex: 2,
      },
      {
        id: "slot-2",
        label: "下方",
        position: { x: CX, y: CY + 150 },
        rotation: 0,
        zIndex: 1,
      },
      {
        id: "slot-3",
        label: "左方",
        position: { x: CX - 190, y: CY },
        rotation: -4,
        zIndex: 2,
      },
      {
        id: "slot-4",
        label: "右方",
        position: { x: CX + 190, y: CY },
        rotation: 4,
        zIndex: 2,
      },
    ],
  },

  tableau: {
    id: "tableau",
    name: "Grand Tableau",
    description: "9×4 桌布，全牌展开，以组合与邻位关系解读。",
    cardCount: 36,
    viewport: { width: 1800, height: 820 },
    slots: gridSlots(9, 4, 178, 185),
  },
};

export const LENORMAND_SPREAD_LIST = Object.values(LENORMAND_LAYOUTS);

export const LENORMAND_SPREADS = LENORMAND_SPREAD_LIST.map((l) => ({
  type: l.id as LenormandSpreadType,
  title: l.name,
  desc: l.description,
  cardCount: l.cardCount,
}));

export const LENORMAND_SPREAD_LABELS: Record<LenormandSpreadType, string> =
  Object.fromEntries(
    LENORMAND_SPREAD_LIST.map((l) => [l.id, l.name])
  ) as Record<LenormandSpreadType, string>;

const COMPACT = new Set<LenormandSpreadType>([
  "daily",
  "pair",
  "line_time",
  "line_cause",
  "cross",
]);

export function getLenormandLayout(
  spread: LenormandSpreadType
): SpreadLayoutConfig {
  const base = LENORMAND_LAYOUTS[spread];
  if (COMPACT.has(spread)) {
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

export function getLenormandCardCount(spread: LenormandSpreadType): number {
  return getLenormandLayout(spread).cardCount;
}

/** Grand Tableau 邻位（9 列 × 4 行） */
export function getTableauNeighbors(index: number): number[] {
  const cols = 9;
  const rows = 4;
  const c = index % cols;
  const r = Math.floor(index / cols);
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      out.push(nr * cols + nc);
    }
  }
  return out;
}
