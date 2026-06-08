"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
import { useVisualProfile } from "@/hooks/useVisualProfile";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false },
);

const CosmicParticles = dynamic(
  () => import("./CosmicParticles").then((m) => m.CosmicParticles),
  { ssr: false },
);

function detectMobileSync() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const touch =
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
  return coarse || narrow || touch;
}

interface ParticleBackgroundProps {
  className?: string;
  dissolve?: number;
  intensity?: number;
  breathAmount?: number;
  breathMode?: boolean;
  tremble?: number;
  interactive?: boolean;
  showGlow?: boolean;
  pauseLoop?: boolean;
}

function Scene({
  dissolve,
  intensity,
  fogColor,
  breathAmount,
  breathMode,
  tremble,
  interactive,
}: {
  dissolve: number;
  intensity: number;
  fogColor: string;
  breathAmount?: number;
  breathMode?: boolean;
  tremble?: number;
  interactive?: boolean;
}) {
  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 2, 8]} />
      <CosmicParticles
        dissolve={dissolve}
        intensity={intensity}
        breathAmount={breathAmount}
        breathMode={breathMode}
        tremble={tremble}
        interactive={interactive}
      />
    </>
  );
}

export function ParticleBackground({
  className = "",
  dissolve = 1,
  intensity = 1,
  breathAmount,
  breathMode = false,
  tremble = 0,
  interactive = true,
  showGlow = true,
  pauseLoop = false,
}: ParticleBackgroundProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const profile = useVisualProfile();
  const [isMobile] = useState(detectMobileSync);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const runLoop = tabVisible && !pauseLoop;
  const scaledIntensity = intensity * profile.particleScale;

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60 }}
          dpr={isMobile || pauseLoop ? 1 : [1, 2]}
          frameloop={runLoop ? "always" : "never"}
          gl={{
            antialias: !isMobile && !pauseLoop,
            alpha: true,
            powerPreference: "low-power",
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            pointerEvents: "none",
          }}
        >
          <Scene
            dissolve={dissolve}
            intensity={scaledIntensity}
            fogColor={c.fog}
            breathAmount={breathAmount}
            breathMode={breathMode}
            tremble={tremble}
            interactive={interactive && !isMobile}
          />
        </Canvas>
      </Suspense>

      {showGlow && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/25 via-transparent to-void"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: profile.tier === "full" ? 0.5 : 0.38,
              background: `radial-gradient(ellipse 72% 48% at 50% 38%, ${c.glowPrimary} 0%, transparent 70%)`,
            }}
          />
          <FloatingGlow
            className="left-1/2 top-[35%] -translate-x-1/2"
            size={isMobile ? 400 : 520}
            color={c.glowPrimary}
          />
          <FloatingGlow
            className="right-[-8%] bottom-[12%] sm:right-[-5%]"
            size={isMobile ? 240 : 320}
            color={c.glowSecondary}
          />
        </>
      )}
    </motion.div>
  );
}
