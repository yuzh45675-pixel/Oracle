"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TarotCard } from "./TarotCard";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { useIsDesktopLayout } from "@/hooks/useMediaQuery";
import {
  SCROLL_CARD_STRIDE,
  scrollVisibleWindow,
} from "@/lib/ritual-performance";
import type { TarotCard as TarotCardType } from "@/types/tarot";

interface DeckScrollPickerProps {
  pool: TarotCardType[];
  pickCount: number;
  excludeIds?: string[];
  onConfirm: (pickedIds: string[]) => void;
}

function splitRows(cards: TarotCardType[]) {
  const mid = Math.ceil(cards.length / 2);
  return [cards.slice(0, mid), cards.slice(mid)] as const;
}

const PickerCardButton = memo(function PickerCardButton({
  card,
  order,
  selected,
  full,
  cardSize,
  onToggle,
}: {
  card: TarotCardType;
  order?: number;
  selected: boolean;
  full: boolean;
  cardSize: "xs" | "sm";
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={full}
      onClick={() => onToggle(card.id)}
      className={`relative shrink-0 rounded-xl transition-transform active:scale-95 disabled:opacity-35 ${
        selected
          ? "ring-2 ring-accent/70 ring-offset-2 ring-offset-void"
          : "opacity-90 hover:opacity-100"
      }`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "108px 74px" }}
      aria-pressed={selected}
      aria-label={card.name}
    >
      <TarotCard
        size={cardSize}
        interactive={false}
        instant
        backDetail="static"
      />
      {selected && order !== undefined && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-void shadow-[0_0_12px_rgba(155,140,255,0.45)] lg:h-6 lg:w-6 lg:text-[11px]">
          {order}
        </span>
      )}
    </button>
  );
});

function ScrollRow({
  cards,
  selectedOrder,
  pickCount,
  onToggle,
  cardSize,
}: {
  cards: TarotCardType[];
  selectedOrder: Map<string, number>;
  pickCount: number;
  onToggle: (id: string) => void;
  cardSize: "xs" | "sm";
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stride = SCROLL_CARD_STRIDE[cardSize];
  const [range, setRange] = useState({ start: 0, end: Math.min(cards.length, 14) });
  const [thumb, setThumb] = useState({ width: 0, left: 0, visible: false });

  // 鼠标按住拖拽 / 拖动圆点滑块的状态
  const panDrag = useRef({ active: false, startX: 0, startLeft: 0 });
  const thumbDrag = useRef({ active: false, startX: 0, startLeft: 0 });
  const movedRef = useRef(false);

  const syncMetrics = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const next = scrollVisibleWindow(
      el.scrollLeft,
      el.clientWidth,
      cards.length,
      stride,
    );
    setRange((prev) =>
      prev.start === next.start && prev.end === next.end ? prev : next,
    );

    const trackW = el.clientWidth;
    const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    if (ratio >= 1) {
      setThumb((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const width = Math.max(ratio * trackW, 36);
    const maxLeft = trackW - width;
    const maxScroll = el.scrollWidth - el.clientWidth || 1;
    const left = (el.scrollLeft / maxScroll) * maxLeft;
    setThumb({ width, left, visible: true });
  }, [cards.length, stride]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncMetrics();
    el.addEventListener("scroll", syncMetrics, { passive: true });
    const ro = new ResizeObserver(syncMetrics);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncMetrics);
      ro.disconnect();
    };
  }, [syncMetrics]);

  // 鼠标按住卡面拖拽浏览（触摸交给原生横向滚动，避免与页面竖向滚动冲突）
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    panDrag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft };
    movedRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panDrag.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - panDrag.current.startX;
    if (Math.abs(dx) > 5) {
      movedRef.current = true;
      el.scrollLeft = panDrag.current.startLeft - dx;
    }
  };

  const endPan = () => {
    panDrag.current.active = false;
  };

  // 拖拽期间吞掉误触选牌的 click
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  const onThumbPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const el = scrollerRef.current;
    if (!el) return;
    thumbDrag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onThumbPointerMove = (e: React.PointerEvent) => {
    if (!thumbDrag.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const trackW = el.clientWidth;
    const maxLeft = trackW - thumb.width || 1;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const dx = e.clientX - thumbDrag.current.startX;
    el.scrollLeft = thumbDrag.current.startLeft + (dx / maxLeft) * maxScroll;
  };

  const onThumbPointerUp = (e: React.PointerEvent) => {
    thumbDrag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const leftSpacer = range.start * stride;
  const rightSpacer = Math.max(0, cards.length - range.end) * stride;
  const visible = cards.slice(range.start, range.end);

  return (
    <div>
      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch", cursor: thumb.visible ? "grab" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerLeave={endPan}
        onClickCapture={onClickCapture}
      >
        <div
          className="flex w-max gap-2.5 px-1 py-1 lg:gap-3.5"
          style={{ contain: "layout style" }}
        >
          {leftSpacer > 0 && (
            <div aria-hidden className="shrink-0" style={{ width: leftSpacer }} />
          )}
          {visible.map((card) => {
            const order = selectedOrder.get(card.id);
            const selected = order !== undefined;
            const full = selectedOrder.size >= pickCount && !selected;

            return (
              <PickerCardButton
                key={card.id}
                card={card}
                order={order}
                selected={selected}
                full={full}
                cardSize={cardSize}
                onToggle={onToggle}
              />
            );
          })}
          {rightSpacer > 0 && (
            <div aria-hidden className="shrink-0" style={{ width: rightSpacer }} />
          )}
        </div>
      </div>

      {thumb.visible && (
        <div className="relative mt-2 h-4 select-none">
          <div className="absolute inset-x-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.08]" />
          <button
            type="button"
            aria-label="拖动浏览牌背"
            className="absolute top-1/2 h-4 -translate-y-1/2 touch-none rounded-full border border-accent/50 bg-accent/30 shadow-[0_0_10px_rgba(155,140,255,0.5)] backdrop-blur transition-colors hover:bg-accent/45 active:bg-accent/55"
            style={{ width: thumb.width, left: thumb.left, cursor: "grab" }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={onThumbPointerUp}
          >
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-frost/90" />
          </button>
        </div>
      )}
    </div>
  );
}

export function DeckScrollPicker({
  pool,
  pickCount,
  excludeIds = [],
  onConfirm,
}: DeckScrollPickerProps) {
  const { triggerBurst } = useParticleInteraction();
  const isDesktop = useIsDesktopLayout();
  const cardSize = isDesktop ? "sm" : "xs";
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  const available = useMemo(
    () => pool.filter((c) => !excludeIds.includes(c.id)),
    [pool, excludeIds],
  );

  const [topRow, bottomRow] = useMemo(
    () => splitRows(available),
    [available],
  );

  const selectedOrder = useMemo(() => {
    const map = new Map<string, number>();
    pickedIds.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [pickedIds]);

  const toggleCard = (id: string) => {
    setPickedIds((prev) => {
      const index = prev.indexOf(id);
      if (index >= 0) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= pickCount) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    if (pickedIds.length !== pickCount) return;
    triggerBurst();
    if (navigator.vibrate) navigator.vibrate([8, 20, 10]);
    onConfirm(pickedIds);
  };

  return (
    <div className="mx-auto w-full max-w-[min(100%,20rem)] sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
      <p className="mb-3 text-center text-xs leading-relaxed text-muted md:mb-4 lg:text-sm">
        {isDesktop ? (
          <>
            全牌分为上下两行，<span className="text-accent">拖动下方圆点</span>或按住卡面拖拽浏览
            <br />
            <span className="text-frost/80">
              点击选牌 · 按选择顺序对应牌阵位置 · 选满 {pickCount} 张后确认
            </span>
          </>
        ) : (
          <>
            <span className="text-accent">① 左右滑动</span>或拖动下方圆点浏览牌背
            <br />
            <span className="text-frost/80">
              <span className="text-accent">② 轻触牌背</span> 选中（角标为顺序）· 选满{" "}
              {pickCount} 张后点下方确认
            </span>
          </>
        )}
      </p>

      <div className="space-y-3 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-2.5 backdrop-blur-md sm:p-4 lg:p-5">
        <div>
          <p className="mb-2 px-1 text-[9px] tracking-[0.22em] text-muted/80 uppercase">
            上行 · {topRow.length} 张
          </p>
          <ScrollRow
            cards={topRow}
            selectedOrder={selectedOrder}
            pickCount={pickCount}
            onToggle={toggleCard}
            cardSize={cardSize}
          />
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div>
          <p className="mb-2 px-1 text-[9px] tracking-[0.22em] text-muted/80 uppercase">
            下行 · {bottomRow.length} 张
          </p>
          <ScrollRow
            cards={bottomRow}
            selectedOrder={selectedOrder}
            pickCount={pickCount}
            onToggle={toggleCard}
            cardSize={cardSize}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="text-[10px] tracking-[0.18em] text-muted/80 uppercase">
          已选 {pickedIds.length} / {pickCount}
        </p>
        <motion.button
          type="button"
          disabled={pickedIds.length !== pickCount}
          onClick={handleConfirm}
          className="rounded-full border border-accent/40 bg-accent/15 px-8 py-2.5 text-sm text-frost transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40 lg:px-10 lg:py-3 lg:text-base"
          whileTap={{ scale: 0.98 }}
        >
          确认选牌
        </motion.button>
        {pickedIds.length > 0 && pickedIds.length < pickCount && (
          <button
            type="button"
            onClick={() => setPickedIds([])}
            className="text-[10px] text-muted hover:text-frost"
          >
            清空重选
          </button>
        )}
      </div>
    </div>
  );
}
