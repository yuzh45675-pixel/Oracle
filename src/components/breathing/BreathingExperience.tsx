"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { BreathingModeSelector } from "@/components/breathing/BreathingModeSelector";
import { useBreathCycle } from "@/hooks/useBreathCycle";
import {
  BREATH_PHASE_LABEL,
  getBreathingMode,
  type BreathingModeId,
} from "@/lib/breathing-modes";

type Step = "pick" | "breathe" | "done";

export function BreathingExperience() {
  const [step, setStep] = useState<Step>("pick");
  const [modeId, setModeId] = useState<BreathingModeId>("balance");
  const [idleBreath, setIdleBreath] = useState(0.72);
  const [showModeSwitch, setShowModeSwitch] = useState(false);

  const mode = getBreathingMode(modeId);
  const breathing = useBreathCycle(mode, step === "breathe");

  useEffect(() => {
    if (step !== "pick") return;
    let raf = 0;
    const tick = () => {
      const t = performance.now() / 9000;
      setIdleBreath(0.72 + 0.08 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  useEffect(() => {
    if (step !== "breathe") setShowModeSwitch(false);
  }, [step]);

  useEffect(() => {
    if (step === "breathe" && breathing.finished) {
      const t = window.setTimeout(() => setStep("done"), 800);
      return () => window.clearTimeout(t);
    }
  }, [step, breathing.finished]);

  const restart = useCallback(() => setStep("pick"), []);
  const begin = useCallback(() => setStep("breathe"), []);
  const skip = useCallback(() => setStep("done"), []);

  const handleModeSwitch = useCallback((id: BreathingModeId) => {
    setModeId(id);
    setShowModeSwitch(false);
  }, []);

  const breath =
    step === "pick"
      ? idleBreath
      : step === "done"
        ? 0.72
        : breathing.breath;
  const tremble = step === "breathe" ? breathing.tremble : 0;

  return (
    <section className="relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-void">
      <ParticleBackground
        intensity={1.05}
        dissolve={1}
        breathAmount={breath}
        breathMode
        tremble={tremble}
        interactive={step === "pick"}
        showGlow
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))]">
        <header className="text-center">
          <p className="text-[10px] tracking-[0.45em] text-accent/75 uppercase">
            Centering
          </p>
          <h1 className="font-display mt-4 text-[1.75rem] font-extralight tracking-tight text-frost sm:text-4xl">
            {step === "pick" && "呼吸"}
            {step === "breathe" && "跟随"}
            {step === "done" && "很好"}
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-muted/90">
            {step === "pick" &&
              "缓慢呼吸，放松身心，以更好的状态感知牌意。"}
            {step === "breathe" && mode.subtitle}
            {step === "done" && "把这份安静带走。"}
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === "breathe" && (
              <motion.div
                key={breathing.phase}
                className="text-center"
                initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-display text-5xl font-extralight tracking-[0.4em] text-frost/95 sm:text-6xl">
                  {BREATH_PHASE_LABEL[breathing.phase]}
                </p>
                <p className="mt-5 text-[10px] tracking-[0.3em] text-muted/60">
                  {mode.rhythm} · {breathing.cycleIndex + 1} / {mode.cycles}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mx-auto w-full max-w-lg pb-2">
          {step === "pick" && (
            <motion.div
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BreathingModeSelector value={modeId} onChange={setModeId} />
              <button
                type="button"
                onClick={begin}
                className="rounded-full border border-white/[0.12] bg-white/[0.06] px-10 py-3.5 text-sm tracking-[0.2em] text-frost backdrop-blur-xl transition-colors hover:border-accent/30 hover:bg-accent/10"
              >
                开始
              </button>
              <Link
                href="/"
                className="text-[10px] tracking-[0.2em] text-muted/50 hover:text-muted"
              >
                返回首页
              </Link>
            </motion.div>
          )}

          {step === "breathe" && (
            <motion.div
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatePresence>
                {showModeSwitch && (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <BreathingModeSelector
                      value={modeId}
                      onChange={handleModeSwitch}
                      excludeId={modeId}
                      label="切换模式"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex w-full max-w-md items-center gap-3">
                <button
                  type="button"
                  onClick={skip}
                  className="flex-1 rounded-full border border-white/[0.14] bg-white/[0.06] py-3.5 text-xs tracking-[0.16em] text-frost/90 backdrop-blur-xl transition-colors hover:border-white/25 hover:bg-white/[0.1]"
                >
                  跳过呼吸
                </button>
                <button
                  type="button"
                  onClick={() => setShowModeSwitch((v) => !v)}
                  className={`flex-1 rounded-full border py-3.5 text-xs tracking-[0.16em] backdrop-blur-xl transition-colors ${
                    showModeSwitch
                      ? "border-accent/35 bg-accent/12 text-frost"
                      : "border-white/[0.14] bg-white/[0.06] text-frost/90 hover:border-accent/25 hover:bg-accent/10"
                  }`}
                >
                  {showModeSwitch ? "收起" : "切换模式"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-white/[0.1] px-8 py-3 text-xs tracking-[0.18em] text-frost/90"
              >
                再来一次
              </button>
              <Link
                href="/"
                className="text-[10px] tracking-[0.2em] text-muted/50 hover:text-muted"
              >
                返回首页
              </Link>
            </motion.div>
          )}
        </footer>
      </div>
    </section>
  );
}
