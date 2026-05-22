"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { TarotCard } from "@/components/tarot/TarotCard";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
import { ThemeOrbStrip } from "@/components/ui/ThemeOrbStrip";
import { useTheme } from "@/context/ThemeContext";
import {
  ReadingSystemSelector,
  type ReadingSystemChoice,
} from "@/components/hero/ReadingSystemSelector";
import { RitualEnterButton } from "@/components/hero/RitualEnterButton";

export function Hero() {
  const { theme } = useTheme();
  const [system, setSystem] = useState<ReadingSystemChoice>("tarot");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const cardX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const cardY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  const setPointer = (clientX: number, clientY: number) => {
    pointerX.set(clientX / window.innerWidth - 0.5);
    pointerY.set(clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden pb-[max(2rem,env(safe-area-inset-bottom))]"
      onMouseMove={(e) => setPointer(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
      }}
    >
      <ParticleBackground intensity={1.05} />

      <FloatingGlow
        className="left-1/2 top-[32%] -translate-x-1/2"
        size={640}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/4 top-[68%] opacity-90"
        size={350}
        color={theme.colors.glowSecondary}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 100%, color-mix(in srgb, var(--mystic) 80%, transparent) 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-16 text-center md:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
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
          className="font-display max-w-3xl text-4xl leading-[1.15] font-extralight tracking-tight text-frost md:text-6xl lg:text-7xl"
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
          className="mx-auto mt-6 max-w-md text-sm leading-relaxed md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span
            className="inline-block tracking-wide"
            style={{
              color: theme.colors.accentSoft,
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0%, #000 35%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.42) 100%)",
              maskImage:
                "linear-gradient(90deg, #000 0%, #000 35%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.42) 100%)",
            }}
          >
            Oracle —— 并非预测未来，而是重新理解当下。
          </span>
        </motion.p>

        <motion.div
          className="relative my-12 md:my-20"
          style={{ x: cardX, y: cardY }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <motion.div
            className="absolute -inset-16 rounded-full opacity-60"
            style={{
              background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 65%)`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <TarotCard size="hero" interactive={false} />
        </motion.div>

        <ReadingSystemSelector value={system} onChange={setSystem} />

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <RitualEnterButton system={system} />
          <AnimatedButton href="/breathe" variant="ghost">
            呼吸
          </AnimatedButton>
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <p className="mb-4 text-center text-[9px] tracking-[0.28em] text-muted/70 uppercase">
            意识色调 · 长按空白处凝聚图案
          </p>
          <ThemeOrbStrip />
        </motion.div>
      </motion.div>
    </section>
  );
}
