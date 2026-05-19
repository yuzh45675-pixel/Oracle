"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCard } from "./TarotCard";

interface CutDeckAnimationProps {
  onCutComplete: (pileIndex: number) => void;
}

const PILES = [
  { label: "左堆", offset: -140 },
  { label: "中堆", offset: 0 },
  { label: "右堆", offset: 140 },
];

export function CutDeckAnimation({ onCutComplete }: CutDeckAnimationProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [merging, setMerging] = useState(false);

  const handlePick = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setMerging(true);
    setTimeout(() => onCutComplete(index), 900);
  };

  return (
    <motion.div
      className="relative mx-auto flex h-[340px] w-full max-w-lg items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="absolute top-0 left-0 right-0 text-center text-sm text-muted">
        凭直觉选择一堆，完成切牌
      </p>

      <AnimatePresence mode="sync">
        {PILES.map((pile, i) => (
          <motion.button
            key={pile.label}
            type="button"
            className="absolute bottom-8 cursor-pointer focus:outline-none"
            style={{ left: `calc(50% + ${pile.offset}px)` }}
            initial={{ x: "-50%", y: 0, rotate: (i - 1) * 4 }}
            animate={
              merging
                ? selected === i
                  ? {
                      x: "-50%",
                      y: -40,
                      rotate: 0,
                      scale: 1.05,
                    }
                  : {
                      x: "-50%",
                      y: 80,
                      opacity: 0,
                      scale: 0.85,
                    }
                : {
                    x: "-50%",
                    y: 0,
                    rotate: (i - 1) * 5,
                  }
            }
            whileHover={selected === null ? { y: -12, scale: 1.03 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={() => handlePick(i)}
            disabled={selected !== null}
          >
            <motion.div
              className="relative"
              style={{
                filter:
                  selected === i
                    ? "drop-shadow(0 20px 40px rgba(110,91,255,0.35))"
                    : "drop-shadow(0 12px 24px rgba(0,0,0,0.4))",
              }}
            >
              {Array.from({ length: 4 }).map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute"
                  style={{
                    left: j * 2,
                    top: -j * 4,
                    zIndex: 4 - j,
                  }}
                >
                  <TarotCard size="md" interactive={false} />
                </motion.div>
              ))}
            </motion.div>
            <span className="mt-24 block text-[10px] tracking-widest text-muted uppercase">
              {pile.label}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {merging && (
        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.2, 1.5] }}
          transition={{ duration: 0.7 }}
          style={{
            width: 120,
            height: 120,
            marginLeft: -60,
            background:
              "radial-gradient(circle, rgba(110,91,255,0.25) 0%, transparent 70%)",
          }}
        />
      )}
    </motion.div>
  );
}
