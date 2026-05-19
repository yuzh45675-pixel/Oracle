"use client";

import { motion } from "framer-motion";
import { TarotCard } from "./TarotCard";

interface ShuffleDeckProps {
  isShuffling: boolean;
}

const STACK = 9;

export function ShuffleDeck({ isShuffling }: ShuffleDeckProps) {
  return (
    <motion.div
      className="relative mx-auto h-[300px] w-[220px] md:h-[340px] md:w-[250px]"
      aria-label={isShuffling ? "正在洗牌" : "牌组"}
    >
      {Array.from({ length: STACK }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: STACK - i,
              marginLeft: -95,
              marginTop: -140,
            }}
            animate={
              isShuffling
                ? {
                    x: [
                      0,
                      side * (30 + i * 6),
                      side * -(20 + i * 4),
                      0,
                    ],
                    y: [0, -35 - i * 3, 12, 0],
                    rotate: [
                      (i - 4) * 2,
                      side * (14 + i * 2),
                      side * -(10 + i),
                      (i - 4) * 2,
                    ],
                    rotateZ: [0, side * 3, 0],
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
            <TarotCard size="lg" interactive={false} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
