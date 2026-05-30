"use client";

import { motion } from "framer-motion";
import { CardFace } from "./CardFace";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

interface ShuffleDeckProps {
  isShuffling: boolean;
}

const DESKTOP_STACK = 9;
const MOBILE_STACK = 4;

/** 手机端：轻量卡背 + CSS 动画，避免 9 张 SVG 卡背 + Framer 无限循环卡顿 */
function MobileShuffleStack({ isShuffling }: { isShuffling: boolean }) {
  return (
    <div
      className="relative mx-auto mt-10 h-[168px] w-[120px] origin-top"
      aria-label={isShuffling ? "正在洗牌" : "牌组"}
    >
      {Array.from({ length: MOBILE_STACK }).map((_, i) => (
        <div
          key={i}
          className={`absolute h-[140px] w-[96px] ${
            isShuffling ? "shuffle-card-mobile" : ""
          }`}
          style={{
            zIndex: MOBILE_STACK - i,
            left: "50%",
            top: "50%",
            marginLeft: -48,
            marginTop: -70,
            transform: isShuffling
              ? undefined
              : `translate(${i * 1.2}px, ${-i * 2}px) rotate(${(i - 1.5) * 1.2}deg)`,
            animationDelay: isShuffling ? `${i * 0.12}s` : undefined,
          }}
        >
          <CardFace
            back
            backDetail="lite"
            className="h-full w-full rounded-xl shadow-card"
          />
        </div>
      ))}
    </div>
  );
}

function DesktopShuffleStack({ isShuffling }: { isShuffling: boolean }) {
  const amp = 1;
  return (
    <div
      className="relative mx-auto h-[340px] w-[250px] origin-center"
      aria-label={isShuffling ? "正在洗牌" : "牌组"}
    >
      {Array.from({ length: DESKTOP_STACK }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: DESKTOP_STACK - i,
              marginLeft: -95,
              marginTop: -140,
            }}
            animate={
              isShuffling
                ? {
                    x: [
                      0,
                      side * (30 + i * 6) * amp,
                      side * -(20 + i * 4) * amp,
                      0,
                    ],
                    y: [0, (-35 - i * 3) * amp, 12 * amp, 0],
                    rotate: [
                      (i - 4) * 2,
                      side * (14 + i * 2) * amp,
                      side * -(10 + i) * amp,
                      (i - 4) * 2,
                    ],
                  }
                : {
                    x: i * 1.5,
                    y: -i * 2.5,
                    rotate: (i - 4) * 1.2,
                  }
            }
            transition={
              isShuffling
                ? {
                    duration: 1.1 + i * 0.04,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.25, 1],
                    delay: i * 0.05,
                  }
                : {
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                  }
            }
          >
            <div className="h-[280px] w-[190px]">
              <CardFace back className="h-full w-full rounded-xl shadow-card" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ShuffleDeck({ isShuffling }: ShuffleDeckProps) {
  const isTouch = useIsTouchDevice();

  if (isTouch) {
    return <MobileShuffleStack isShuffling={isShuffling} />;
  }

  return <DesktopShuffleStack isShuffling={isShuffling} />;
}
