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

function computeTableHeight(spreadHeight: number): number {
  if (typeof window === "undefined") return 520;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;
  const isLarge = w >= 1024;
  const tall = spreadHeight > 900;
  if (isMobile) {
    return Math.min(h * (tall ? 0.58 : 0.5), tall ? 560 : 460);
  }
  if (isLarge) {
    return Math.min(tall ? 960 : 760, h * 0.68);
  }
  return Math.min(tall ? 900 : 680, h * 0.62);
}

export function useSpreadLayout(
  spread: SpreadType | null,
  containerWidth: number,
  containerHeight: number
) {
  const layout = spread ? getSpreadLayout(spread) : null;

  const { scale, offsetX, offsetY, scaledSlots } = useMemo(() => {
    if (!layout || containerWidth <= 0 || containerHeight <= 0) {
      return {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        scaledSlots: [] as ScaledSlot[],
      };
    }

    const pad = containerWidth < 768 ? 56 : 48;
    const availW = containerWidth - pad * 2;
    const availH = containerHeight - pad * 2;

    const scaleX = availW / layout.viewport.width;
    const scaleY = availH / layout.viewport.height;
    const isCompact =
      layout.cardCount <= 5 &&
      ["single", "three", "five"].includes(layout.id);
    const mobile = containerWidth < 768;
    const maxScale = mobile ? (isCompact ? 0.92 : 0.88) : isCompact ? 1 : 1.15;
    const scale = Math.min(scaleX, scaleY, maxScale);

    const contentW = layout.viewport.width * scale;
    const contentH = layout.viewport.height * scale;
    const offsetX = (containerWidth - contentW) / 2;
    const offsetY = (containerHeight - contentH) / 2;

    let scaledSlots: ScaledSlot[] = layout.slots.map((slot) => ({
      ...slot,
      x: offsetX + slot.position.x * scale,
      y: offsetY + slot.position.y * scale,
      scale,
    }));

    if (scaledSlots.length > 0) {
      const xs = scaledSlots.map((s) => s.x);
      const ys = scaledSlots.map((s) => s.y);
      const gx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const gy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const dx = containerWidth / 2 - gx;
      const dy = containerHeight / 2 - gy;
      scaledSlots = scaledSlots.map((s) => ({
        ...s,
        x: s.x + dx,
        y: s.y + dy,
      }));
    }

    return { scale, offsetX, offsetY, scaledSlots };
  }, [layout, containerWidth, containerHeight]);

  return {
    layout,
    scale,
    offsetX,
    offsetY,
    scaledSlots,
    viewportWidth: layout ? layout.viewport.width * scale : 0,
    viewportHeight: layout ? layout.viewport.height * scale : 0,
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
