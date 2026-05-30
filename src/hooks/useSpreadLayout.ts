"use client";

import { useEffect, useMemo, useState } from "react";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import type { SpreadCardSlot } from "@/lib/spreadLayouts";
import type { SpreadType } from "@/types/tarot";

export interface ScaledSlot extends SpreadCardSlot {
  x: number;
  y: number;
  scale: number;
}

export interface SpreadLayoutResult {
  layout: ReturnType<typeof getSpreadLayout> | null;
  scale: number;
  scaledSlots: ScaledSlot[];
  /** 牌阵内容框尺寸（按牌位中心包围盒计算），用于 CSS 居中 */
  contentWidth: number;
  contentHeight: number;
  cardScale: number;
}

function computeTableHeight(spreadHeight: number): number {
  if (typeof window === "undefined") return 520;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;
  const isLarge = w >= 1024;
  const tall = spreadHeight > 900;
  if (isMobile) {
    const tall = spreadHeight > 900;
    const wide = spreadHeight >= 720;
    return Math.min(h * (tall ? 0.68 : wide ? 0.62 : 0.58), tall ? 680 : wide ? 580 : 520);
  }
  if (isLarge) {
    return Math.min(tall ? 960 : 760, h * 0.68);
  }
  return Math.min(tall ? 900 : 680, h * 0.62);
}

export function useSpreadLayout(
  spread: SpreadType | null,
  containerWidth: number,
  containerHeight: number,
): SpreadLayoutResult {
  const layout = spread ? getSpreadLayout(spread) : null;

  const { scale, scaledSlots, contentWidth, contentHeight } = useMemo(() => {
    if (!layout || containerWidth <= 0 || containerHeight <= 0) {
      return {
        scale: 1,
        scaledSlots: [] as ScaledSlot[],
        contentWidth: 0,
        contentHeight: 0,
      };
    }

    const pad = containerWidth < 768 ? 14 : 48;
    const availW = containerWidth - pad * 2;
    const availH = containerHeight - pad * 2;

    const scaleX = availW / layout.viewport.width;
    const scaleY = availH / layout.viewport.height;
    const isCompact =
      layout.cardCount <= 5 &&
      ["single", "three", "five"].includes(layout.id);
    const mobile = containerWidth < 768;
    const maxScale = mobile ? (isCompact ? 1.08 : 0.9) : isCompact ? 1 : 1.15;
    const scale = Math.min(scaleX, scaleY, maxScale);

    // 牌位中心在缩放后的坐标
    const sx = layout.slots.map((s) => s.position.x * scale);
    const sy = layout.slots.map((s) => s.position.y * scale);
    const minX = Math.min(...sx);
    const maxX = Math.max(...sx);
    const minY = Math.min(...sy);
    const maxY = Math.max(...sy);

    // 内容框 = 牌位中心包围盒；牌位坐标相对内容框左上角，靠 CSS 居中内容框即可
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaledSlots: ScaledSlot[] = layout.slots.map((slot, i) => ({
      ...slot,
      x: (sx[i] ?? 0) - minX,
      y: (sy[i] ?? 0) - minY,
      scale,
    }));

    return { scale, scaledSlots, contentWidth, contentHeight };
  }, [layout, containerWidth, containerHeight]);

  return {
    layout,
    scale,
    scaledSlots,
    contentWidth,
    contentHeight,
    cardScale: scale,
  };
}

export function useSpreadContainerSize(spreadHeight = 720) {
  const [tableHeight, setTableHeight] = useState(() =>
    computeTableHeight(spreadHeight)
  );
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateHeight = () => setTableHeight(computeTableHeight(spreadHeight));
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [spreadHeight]);

  useEffect(() => {
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setLayoutSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [node, tableHeight]);

  const size =
    layoutSize.width > 0
      ? layoutSize
      : { width: 0, height: tableHeight };

  return { size, tableHeight, setContainerRef: setNode };
}
