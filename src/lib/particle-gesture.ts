/** 触摸/长按粒子手势应忽略的可交互区域 */
export function shouldIgnoreParticleGesture(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, label, [data-particle-pass]",
    ),
  );
}
