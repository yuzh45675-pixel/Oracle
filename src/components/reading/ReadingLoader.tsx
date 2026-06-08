"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHRASES = [
  "正在校准星象……",
  "聆听牌面之间的回响……",
  "把符号译成语言……",
];

const PHRASE_MS = 3200;

/** AI 解读等待时的轻量过渡动画：流光卡 + 呼吸光点，缓解等待卡顿感 */
export function ReadingLoader() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, PHRASE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="mb-4 overflow-hidden rounded-xl border border-accent/20 bg-white/[0.03] px-4 py-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-7 w-7 shrink-0">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-accent/50"
              animate={{ scale: [0.5, 1.15], opacity: [0.7, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-frost/90">读牌中</span>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-accent/80"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="mt-2 min-h-[1.25rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={phraseIndex}
                className="text-xs text-muted"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.span
          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
