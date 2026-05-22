"use client";

import { useEffect, useMemo, useState } from "react";
import { getLenormandLayout } from "@/lib/lenormand/layouts";
import type { SpreadCardSlot } from "@/lib/spreadLayouts";
import type { LenormandSpreadType } from "@/types/lenormand";

export interface ScaledSlot extends SpreadCardSlot {
  x: number;
  y: number;
  scale: number;
}

function computeTableHeight(spreadHeight: number, isTableau: boolean): number {
  if (typeof window === "undefined") return isTableau ? 560 : 480;
  const h = window.innerHeight;
  if (isTableau) return Math.min(h * 0.72, 720);
  return Math.min(h * 0.58, spreadHeight > 900 ? 640 : 520);
}

export function useLenormandSpreadLayout(
  spread: LenormandSpreadType | null,
  containerWidth: number,
  containerHeight: number
) {
  const layout = spread ? getLenormandLayout(spread) : null;
  const isTableau = spread === "tableau";

  const { scale, scaledSlots } = useMemo(() => {
    if (!layout || containerWidth <= 0 || containerHeight <= 0) {
      return { scale: 1, scaledSlots: [] as ScaledSlot[] };
    }

    const pad = isTableau ? 24 : 48;
    const availW = containerWidth - pad * 2;
    const availH = containerHeight - pad * 2;
    const isCompact = !isTableau && layout.cardCount <= 5;
    const scaleX = availW / layout.viewport.width;
    const scaleY = availH / layout.viewport.height;
    const scale = Math.min(scaleX, scaleY, isCompact ? 1 : 1.1);

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

    if (layout.cardCount === 1 && scaledSlots[0]) {
      scaledSlots = [
        {
          ...scaledSlots[0],
          x: containerWidth / 2,
          y: containerHeight / 2,
        },
      ];
    }

    return { scale, scaledSlots };
  }, [layout, containerWidth, containerHeight, isTableau]);

  return { layout, scaledSlots, scale };
}

export function useLenormandTableSize(
  viewportHeight: number,
  spread: LenormandSpreadType | null
) {
  const isTableau = spread === "tableau";
  const [tableHeight, setTableHeight] = useState(() =>
    computeTableHeight(viewportHeight, isTableau)
  );
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () =>
      setTableHeight(computeTableHeight(viewportHeight, isTableau));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [viewportHeight, isTableau]);

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
      : {
          width:
            typeof window !== "undefined"
              ? Math.min(window.innerWidth - 48, 896)
              : 896,
          height: tableHeight,
        };

  return { containerSize: size, tableHeight, setContainerRef: setNode };
}
