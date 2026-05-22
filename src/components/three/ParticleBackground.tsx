"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { FloatingGlow } from "@/components/ui/FloatingGlow";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false },
);

const CosmicParticles = dynamic(
  () => import("./CosmicParticles").then((m) => m.CosmicParticles),
  { ssr: false },
);

interface ParticleBackgroundProps {
  className?: string;
  dissolve?: number;
  intensity?: number;
  breathAmount?: number;
  breathMode?: boolean;
  tremble?: number;
  interactive?: boolean;
  showGlow?: boolean;
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
}: ParticleBackgroundProps) {
  const { theme } = useTheme();
  const c = theme.colors;

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
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
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
            intensity={intensity}
            fogColor={c.fog}
            breathAmount={breathAmount}
            breathMode={breathMode}
            tremble={tremble}
            interactive={interactive}
          />
        </Canvas>
      </Suspense>

      {showGlow && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/25 via-transparent to-void"
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(ellipse 72% 48% at 50% 38%, ${c.glowPrimary} 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <FloatingGlow
            className="left-1/2 top-[35%] -translate-x-1/2 opacity-80"
            size={520}
            color={c.glowPrimary}
          />
          <FloatingGlow
            className="right-[-5%] bottom-[15%] opacity-70"
            size={320}
            color={c.glowSecondary}
          />
        </>
      )}
    </motion.div>
  );
}
