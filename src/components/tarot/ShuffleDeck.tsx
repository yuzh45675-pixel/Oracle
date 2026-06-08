"use client";

import { CardFace } from "./CardFace";

interface ShuffleDeckProps {
  isShuffling: boolean;
}

const IDLE_STACK = 4;
const SHUFFLE_STACK = 3;

const IDLE_OFFSETS = [
  { x: 0, y: 0, rot: -1.2 },
  { x: 1.5, y: -2.5, rot: 0 },
  { x: 3, y: -5, rot: 1.2 },
  { x: 4.5, y: -7.5, rot: 2.4 },
];

/**
 * 洗牌：精美卡背 + CSS 位移动画；裁剪溢出避免牌影闪到屏幕角落。
 */
function ShuffleStack({ isShuffling }: { isShuffling: boolean }) {
  const count = isShuffling ? SHUFFLE_STACK : IDLE_STACK;

  return (
    <div
      className={`relative mx-auto origin-center ${
        isShuffling
          ? "shuffle-deck-perf mt-8 h-[200px] w-[156px] sm:mt-10 sm:h-[220px] sm:w-[172px]"
          : "shuffle-stack-idle mt-10 h-[168px] w-[120px] sm:mt-0 sm:h-[340px] sm:w-[250px]"
      }`}
      aria-label={isShuffling ? "正在洗牌" : "牌组"}
    >
      {Array.from({ length: count }).map((_, i) => {
        const off = IDLE_OFFSETS[i] ?? IDLE_OFFSETS[0]!;

        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 [backface-visibility:hidden] ${
              isShuffling
                ? "h-[128px] w-[88px] shuffle-card-mobile sm:h-[136px] sm:w-[94px]"
                : "shuffle-idle-card h-[140px] w-[96px] sm:h-[280px] sm:w-[190px]"
            }`}
            style={{
              zIndex: count - i,
              ["--idle-x" as string]: `${off.x}px`,
              ["--idle-y" as string]: `${off.y}px`,
              ["--idle-rot" as string]: `${off.rot}deg`,
              animationDelay: isShuffling ? `${i * 0.14}s` : undefined,
            }}
          >
            <CardFace
              back
              backDetail="static"
              className="h-full w-full rounded-xl shadow-card"
            />
          </div>
        );
      })}
    </div>
  );
}

export function ShuffleDeck({ isShuffling }: ShuffleDeckProps) {
  return (
    <div
      className={
        isShuffling
          ? "mx-auto max-w-[11rem] overflow-hidden sm:max-w-[12rem]"
          : undefined
      }
    >
      <ShuffleStack isShuffling={isShuffling} />
    </div>
  );
}
