"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { TarotCard } from "@/components/tarot/TarotCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
type ReadingSystemChoice = "tarot" | "lenormand";

export function Hero() {
  const [system, setSystem] = useState<ReadingSystemChoice>("tarot");
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const cardY = useTransform(springY, [-0.5, 0.5], [-12, 12]);
  const cardX = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      onMouseMove={(e) => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(e.clientX / innerWidth - 0.5);
        mouseY.set(e.clientY / innerHeight - 0.5);
      }}
    >
      <ParticleBackground intensity={1} />
      <FloatingGlow className="left-1/2 top-1/3 -translate-x-1/2" size={700} />
      <FloatingGlow
        className="left-1/4 top-2/3"
        color="rgba(74, 108, 247, 0.15)"
        size={350}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(27,24,48,0.8) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 pt-32 pb-20 text-center md:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          className="mb-6 text-xs tracking-[0.5em] text-accent/90 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Digital Oracle
        </motion.p>

        <motion.h1
          className="font-display max-w-3xl text-4xl font-extralight leading-[1.15] tracking-tight text-frost md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          在静默中
          <br />
          <span className="bg-gradient-to-r from-frost via-metal to-accent/80 bg-clip-text text-transparent">
            遇见答案
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {"Oracle —— 并非预测未来，而是重新理解当下。"}
        </motion.p>

        <motion.div
          className="relative my-14 md:my-20"
          style={{ x: cardX, y: cardY }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <motion.div
            className="absolute -inset-16 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(110,91,255,0.2) 0%, transparent 65%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <TarotCard size="hero" interactive={false} />
        </motion.div>

        <motion.div
          className="mt-4 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <p className="text-[10px] tracking-[0.35em] text-muted/80 uppercase">
            解读体系
          </p>
          <motion.div className="flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            {(
              [
                ["tarot", "Tarot 塔罗"],
                ["lenormand", "Lenormand 雷诺曼"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSystem(id)}
                className={`rounded-full px-4 py-2 text-xs tracking-wide transition-all ${
                  system === id
                    ? "bg-accent/20 text-frost"
                    : "text-muted hover:text-frost"
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
          <p className="max-w-sm text-xs leading-relaxed text-muted/90">
            {system === "tarot"
              ? "心理象征、正逆位、经典塔罗牌阵。"
              : "现实事件、符号组合、无逆位，以牌际关系推演。"}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <AnimatedButton
            href={
              system === "lenormand"
                ? "/reading?deck=lenormand"
                : "/reading?deck=waite"
            }
          >
            开始占卜
          </AnimatedButton>
          <AnimatedButton href="/about" variant="ghost">
            探索理念
          </AnimatedButton>
        </motion.div>

        <motion.p
          className="mt-16 text-[10px] tracking-[0.3em] text-muted/60 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Scroll to descend
        </motion.p>
      </motion.div>
    </section>
  );
}
