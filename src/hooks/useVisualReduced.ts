"use client";

import { useEffect, useState } from "react";

/** 移动端 / 用户偏好减少动效时，关闭易闪烁的全屏叠层 */
export function useVisualReduced(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const touch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(coarse || narrow || touch || motion);
  }, []);

  return reduced;
}
