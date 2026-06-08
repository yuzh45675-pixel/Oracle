"use client";

import { useEffect, useState } from "react";

export type VisualTier = "full" | "balanced" | "minimal";

export type VisualProfile = {
  tier: VisualTier;
  /** 桌面可用 mix-blend；手机用普通叠层避免整屏闪烁 */
  noiseMixBlend: boolean;
  /** 光晕缓慢 scale 动画（不脉冲 opacity） */
  glowMotion: boolean;
  /** 粒子强度倍率 */
  particleScale: number;
};

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches ||
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
  );
}

function profileForTier(tier: VisualTier): VisualProfile {
  if (tier === "minimal") {
    return {
      tier,
      noiseMixBlend: false,
      glowMotion: false,
      particleScale: 0.55,
    };
  }
  if (tier === "balanced") {
    return {
      tier,
      noiseMixBlend: false,
      glowMotion: true,
      particleScale: 0.8,
    };
  }
  return {
    tier: "full",
    noiseMixBlend: true,
    glowMotion: true,
    particleScale: 1,
  };
}

/** 按机型分级：保留全部视觉效果，仅调整易闪烁的渲染方式 */
export function useVisualProfile(): VisualProfile {
  const [profile, setProfile] = useState<VisualProfile>(() =>
    profileForTier("balanced"),
  );

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (motionMq.matches) {
        setProfile(profileForTier("minimal"));
        return;
      }
      setProfile(profileForTier(detectMobile() ? "balanced" : "full"));
    };
    apply();
    motionMq.addEventListener("change", apply);
    return () => motionMq.removeEventListener("change", apply);
  }, []);

  return profile;
}
