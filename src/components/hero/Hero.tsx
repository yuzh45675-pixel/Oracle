"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { useTheme } from "@/context/ThemeContext";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import type { ReadingSystemChoice } from "@/components/hero/ReadingSystemSelector";
import { HeroMobile } from "@/components/hero/HeroMobile";
import { HeroDesktop } from "@/components/hero/HeroDesktop";

export function Hero() {
  const { theme } = useTheme();
  const isTouch = useIsTouchDevice();
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

  const layoutProps = {
    system,
    onSystemChange: setSystem,
    cardX,
    cardY,
    theme,
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col overflow-hidden pb-[max(2rem,env(safe-area-inset-bottom))] lg:justify-center"
      onMouseMove={(e) => setPointer(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
      }}
    >
      <ParticleBackground intensity={isTouch ? 0.82 : 1.05} />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 100%, color-mix(in srgb, var(--mystic) 80%, transparent) 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="lg:hidden">
        <HeroMobile {...layoutProps} />
      </div>
      <div className="hidden lg:block">
        <HeroDesktop {...layoutProps} />
      </div>
    </section>
  );
}
