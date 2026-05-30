"use client";

import { useEffect, useMemo, useState } from "react";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import type { SpreadCardSlot } from "@/lib/spreadLayouts";
import { spreadCenterBias } from "@/lib/spread-visual-bias";
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
    const wide = spreadHeight >= 720;
    return Math.min(h * (tall ? 0.68 : wide ? 0.62 : 0.58), tall ? 680 : wide ? 580 : 520);
  }
  if (isLarge) {
    return Math.min(tall ? 960 : 760, h * 0.68);
  }
  return Math.min(tall ? 900 : 680, h * 0.62);
}

function fallbackContainerWidth(): number {
  if (typeof window === "undefined") return 360;
  return Math.max(Math.min(window.innerWidth - 24, 896), 280);
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

    const pad = containerWidth < 768 ? 12 : 36;
    const availW = Math.max(containerWidth - pad * 2, 1);
    const availH = Math.max(containerHeight - pad * 2, 1);

    const scaleX = availW / layout.viewport.width;
    const scaleY = availH / layout.viewport.height;
    const isCompact =
      layout.cardCount <= 5 &&
      ["single", "three", "five"].includes(layout.id);
    const mobile = containerWidth < 768;
    const maxScale = mobile ? (isCompact ? 1.06 : 0.92) : isCompact ? 1 : 1.12;
    const scale = Math.min(scaleX, scaleY, maxScale);
    const bias = spreadCenterBias(containerWidth);

    let slots: ScaledSlot[] = layout.slots.map((slot) => ({
      ...slot,
      x: slot.position.x * scale,
      y: slot.position.y * scale,
      scale,
    }));

    if (slots.length > 0) {
      const xs = slots.map((s) => s.x);
      const ys = slots.map((s) => s.y);
      const gx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const gy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const dx = containerWidth / 2 - gx + bias.x;
      const dy = containerHeight / 2 - gy + bias.y;
      slots = slots.map((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
    }

    if (layout.cardCount === 1 && slots[0]) {
      slots = [
        {
          ...slots[0],
          x: containerWidth / 2 + bias.x,
          y: containerHeight / 2 + bias.y,
        },
      ];
    }

    const xs = slots.map((s) => s.x);
    const ys = slots.map((s) => s.y);

    return {
      scale,
      scaledSlots: slots,
      contentWidth: Math.max(...xs) - Math.min(...xs),
      contentHeight: Math.max(...ys) - Math.min(...ys),
    };
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
    computeTableHeight(spreadHeight),
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
      : { width: fallbackContainerWidth(), height: tableHeight };

  return { size, tableHeight, setContainerRef: setNode };
}
