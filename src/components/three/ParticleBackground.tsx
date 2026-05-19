"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

const CosmicParticles = dynamic(
  () =>
    import("./CosmicParticles").then((m) => m.CosmicParticles),
  { ssr: false }
);

interface ParticleBackgroundProps {
  className?: string;
  dissolve?: number;
  intensity?: number;
}

function Scene({
  dissolve,
  intensity,
}: {
  dissolve: number;
  intensity: number;
}) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 2, 8]} />
      <CosmicParticles dissolve={dissolve} intensity={intensity} />
    </>
  );
}

export function ParticleBackground({
  className = "",
  dissolve = 1,
  intensity = 1,
}: ParticleBackgroundProps) {
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
          style={{ background: "transparent", pointerEvents: "none" }}
        >
          <Scene dissolve={dissolve} intensity={intensity} />
        </Canvas>
      </Suspense>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/20 via-transparent to-void"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(27,24,48,0.6) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
