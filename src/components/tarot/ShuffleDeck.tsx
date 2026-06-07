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
 * 洗牌：精美 static 卡背 + 纯 CSS 位移动画（GPU 合成层，无 Framer 无限循环）。
 * 动画时仅 3 张参与；外层 scale 略降以减轻手机像素填充压力。
 */
function ShuffleStack({ isShuffling }: { isShuffling: boolean }) {
  const count = isShuffling ? SHUFFLE_STACK : IDLE_STACK;

  return (
    <div
      className={`relative mx-auto origin-top ${
        isShuffling
          ? "shuffle-deck-perf mt-10 h-[168px] w-[120px] sm:mt-12 sm:h-[220px] sm:w-[158px]"
          : "shuffle-stack-idle mt-10 h-[168px] w-[120px] sm:mt-0 sm:h-[340px] sm:w-[250px]"
      }`}
      aria-label={isShuffling ? "正在洗牌" : "牌组"}
    >
      {Array.from({ length: count }).map((_, i) => {
        const off = IDLE_OFFSETS[i] ?? IDLE_OFFSETS[0]!;

        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 h-[140px] w-[96px] [backface-visibility:hidden] sm:h-[280px] sm:w-[190px] ${
              isShuffling
                ? "-translate-x-1/2 -translate-y-1/2 shuffle-card-mobile"
                : "shuffle-idle-card"
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
  return <ShuffleStack isShuffling={isShuffling} />;
}
