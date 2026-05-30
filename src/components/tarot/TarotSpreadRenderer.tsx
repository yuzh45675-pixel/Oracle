"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TarotCard } from "./TarotCard";
import { TarotTable } from "./TarotTable";
import {
  useSpreadContainerSize,
  useSpreadLayout,
  type ScaledSlot,
} from "@/hooks/useSpreadLayout";
import { useIsMobileLayout } from "@/hooks/useMediaQuery";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import { getActiveCardIndex } from "@/lib/spreadReveal";
import { spreadTableCrop } from "@/lib/spread-visual-bias";
import type { DrawnCard, SpreadType } from "@/types/tarot";

interface TarotSpreadRendererProps {
  spread: SpreadType;
  cards: DrawnCard[];
  flipped: boolean[];
  revealedCount: number;
  onReveal: () => void;
}

function cardSizeForCount(
  count: number,
  isMobile: boolean,
  compact = false,
): "xs" | "sm" | "md" | "lg" {
  if (isMobile) {
    if (compact) return "xs";
    if (count <= 3) return "sm";
    return "xs";
  }
  if (count <= 3) return "lg";
  if (count <= 7) return "md";
  return "sm";
}

interface SpreadTableViewProps {
  displayCards: DrawnCard[];
  flipped: boolean[];
  scaledSlots: ScaledSlot[];
  containerRef: (node: HTMLDivElement | null) => void;
  tableHeight: number;
  isMobile: boolean;
  allDone: boolean;
  activeIndex: number;
  onReveal: () => void;
  enablePan: boolean;
  showBacksForUnflipped?: boolean;
  hideActiveInTable?: boolean;
}

function SpreadTableView({
  displayCards,
  flipped,
  scaledSlots,
  containerRef,
  tableHeight,
  isMobile,
  allDone,
  activeIndex,
  onReveal,
  enablePan,
  showBacksForUnflipped = false,
  hideActiveInTable = false,
}: SpreadTableViewProps) {
  const size = cardSizeForCount(displayCards.length, isMobile, isMobile);

  return (
    <TarotTable
      className="mx-auto w-full min-w-0 max-w-full"
      style={{
        height: tableHeight,
        minHeight: isMobile ? 340 : 320,
      }}
      enablePan={!isMobile && enablePan}
      cropTopLeft={spreadTableCrop(isMobile)}
    >
      <div ref={containerRef} className="relative h-full w-full">
        {displayCards.map((drawn, i) => {
          const slot = scaledSlots[i];
          if (!slot || !drawn?.card?.id) return null;

          const isFlipped = flipped[i];
          const isActive = !allDone && i === activeIndex && !isFlipped;
          const canFlip = isActive && !hideActiveInTable;
          const hideSlot = hideActiveInTable && isActive;

          if (hideSlot) {
            return (
              <motion.div
                key={`slot-marker-${drawn.slotId ?? drawn.card.id}-${i}`}
                className="absolute left-0 top-0"
                style={{
                  left: slot.x,
                  top: slot.y,
                  zIndex: slot.zIndex + 5,
                  transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
                }}
              >
                <div className="flex h-[108px] w-[74px] items-center justify-center rounded-xl border-2 border-dashed border-accent/35 bg-accent/5 sm:h-[140px] sm:w-[96px]">
                  <span className="text-[8px] text-accent/70">此处</span>
                </div>
              </motion.div>
            );
          }

          const showFace = isFlipped;
          const showBack = !isFlipped && showBacksForUnflipped;
          const showGhost = !isFlipped && !showBack && !canFlip;

          if (!showFace && !showBack && !canFlip && !showGhost) return null;

          return (
            <motion.div
              key={`${drawn.slotId ?? drawn.card.id}-${i}`}
              className="absolute left-0 top-0"
              style={{
                left: slot.x,
                top: slot.y,
                zIndex: isActive ? 200 : isFlipped ? 50 + i : slot.zIndex + 10,
                pointerEvents: canFlip ? "auto" : "none",
                transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
                transformOrigin: "center center",
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: showGhost ? 0.28 : showBack ? 0.55 : 1,
                scale: isFlipped && isMobile ? 1 : isActive ? 1.04 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                delay: isFlipped ? i * 0.03 : 0,
              }}
            >
              <div className="relative inline-block">
                {(showFace || canFlip || showGhost) && (
                  <span
                    className={`pointer-events-none absolute bottom-full left-1/2 mb-1.5 w-max max-w-[96px] -translate-x-1/2 text-center text-[8px] tracking-[0.2em] uppercase sm:text-[9px] ${
                      isActive ? "text-accent" : "text-muted/90"
                    }`}
                  >
                    {drawn.position}
                    {isActive ? " · 翻开" : ""}
                  </span>
                )}
                {showGhost ? (
                  <div className="flex h-[108px] w-[74px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] sm:h-[140px] sm:w-[96px]">
                    <span className="text-[7px] tracking-widest text-muted/60">
                      {drawn.position}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`rounded-xl ${isActive ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-transparent" : ""}`}
                  >
                    <TarotCard
                      card={drawn.card}
                      reversed={drawn.reversed}
                      flipped={showFace}
                      settled={showFace}
                      onFlip={canFlip ? onReveal : undefined}
                      size={size}
                      interactive={canFlip}
                      backDetail={showBack ? "static" : "full"}
                      instant={showBack}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </TarotTable>
  );
}

function MobileFlipFocus({
  displayCards,
  activeIndex,
  revealedCount,
  active,
  onReveal,
}: {
  displayCards: DrawnCard[];
  activeIndex: number;
  revealedCount: number;
  active: DrawnCard | undefined;
  onReveal: () => void;
}) {
  const total = displayCards.length;

  return (
    <div className="mb-5 md:hidden">
      <div className="mb-4 flex items-center justify-center gap-1.5">
        {displayCards.map((_, i) => (
          <span
            key={`dot-${i}`}
            className={`h-1.5 rounded-full transition-all ${
              i < revealedCount
                ? "w-4 bg-accent"
                : i === activeIndex
                  ? "w-6 bg-accent/50 ring-1 ring-accent/40"
                  : "w-1.5 bg-white/15"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-[10px] tracking-[0.2em] text-muted uppercase">
        第 {revealedCount + 1} 张 · 共 {total} 张
      </p>
      <p className="mt-2 text-center text-base font-medium text-frost">
        {active?.position ?? "此位置"}
      </p>
      <p className="mt-2 animate-pulse text-center text-xs text-accent">
        ↓ 轻触牌背翻开 · 翻开后归入下方牌阵
      </p>

      <div className="mt-5 flex justify-center">
        {active && (
          <motion.div
            key={`active-${activeIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl ring-2 ring-accent/45 ring-offset-4 ring-offset-void"
          >
            <TarotCard
              card={active.card}
              reversed={active.reversed}
              flipped={false}
              onFlip={onReveal}
              size="md"
              interactive
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function fallbackSpreadWidth(): number {
  if (typeof window === "undefined") return 360;
  return Math.max(Math.min(window.innerWidth - 24, 896), 280);
}

export function TarotSpreadRenderer({
  spread,
  cards,
  flipped,
  revealedCount,
  onReveal,
}: TarotSpreadRendererProps) {
  const isMobile = useIsMobileLayout();
  const layoutMeta = getSpreadLayout(spread);
  const { size: containerSize, tableHeight, setContainerRef } =
    useSpreadContainerSize(layoutMeta.viewport.height);
  const previewHeight = Math.max(Math.round(tableHeight * 0.72), 260);
  const expectedCount = layoutMeta.cardCount;
  const displayCards = cards.slice(0, expectedCount);
  const activeIndex = getActiveCardIndex(spread, revealedCount);
  const allDone = revealedCount >= expectedCount;

  const layoutWidth =
    containerSize.width > 0 ? containerSize.width : fallbackSpreadWidth();
  const layoutHeight =
    containerSize.height > 0
      ? containerSize.height
      : isMobile && !allDone
        ? previewHeight
        : tableHeight;
  const { scaledSlots } = useSpreadLayout(
    spread,
    layoutWidth,
    layoutHeight,
  );

  const active = displayCards[activeIndex];

  const enablePan =
    !isMobile &&
    (allDone || revealedCount > 0) &&
    (expectedCount > 5 ||
      spread === "celtic" ||
      spread === "twelve_house" ||
      spread === "soul_journey");

  const tableProps = {
    displayCards,
    flipped,
    scaledSlots,
    isMobile,
    allDone,
    activeIndex,
    onReveal,
    enablePan,
  };

  if (isMobile && !allDone) {
    return (
      <div className="w-full min-w-0">
        <MobileFlipFocus
          displayCards={displayCards}
          activeIndex={activeIndex}
          revealedCount={revealedCount}
          active={active}
          onReveal={onReveal}
        />

        <div className="md:hidden">
          <p className="mb-2 text-center text-[10px] tracking-widest text-muted uppercase">
            {revealedCount > 0 ? "已翻开 · 牌阵合成中" : "牌阵预览"}
          </p>
          <SpreadTableView
            {...tableProps}
            containerRef={setContainerRef}
            tableHeight={revealedCount > 0 ? previewHeight : Math.min(previewHeight, 300)}
            showBacksForUnflipped
            hideActiveInTable
          />
        </div>
      </div>
    );
  }

  if (isMobile && allDone) {
    return (
      <div className="w-full min-w-0">
        <AnimatePresence>
          <motion.p
            key="merged"
            className="mb-3 text-center text-xs text-muted md:hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            牌面已全部翻开 · 牌阵已与线下摆法一致
          </motion.p>
        </AnimatePresence>
        <SpreadTableView
          {...tableProps}
          containerRef={setContainerRef}
          tableHeight={tableHeight}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <SpreadTableView
        {...tableProps}
        containerRef={setContainerRef}
        tableHeight={tableHeight}
      />
    </div>
  );
}
