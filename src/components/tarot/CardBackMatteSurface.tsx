import type { OracleTheme } from "@/lib/themes";

/** 与 OracleEyeCardBackArt 眼睛坐标对齐 */
const CARD_W = 300;
const CARD_H = 440;
const EYE_CX = 150;
const EYE_CY = 212;
const EYE_RING_R = 12;

/** 磨砂黑底 + 主题光影 + 左右环光 + 镭射银闪卡质感 */
export function CardBackMatteSurface({
  theme,
  lite = false,
}: {
  theme: OracleTheme;
  lite?: boolean;
}) {
  const c = theme.colors;

  return (
    <>
      <div className="absolute inset-0" style={{ background: c.void }} />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `linear-gradient(145deg, ${c.cardBackFrom} 0%, ${c.mystic} 42%, ${c.cardBackTo} 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 28%, ${c.glowPrimary} 0%, transparent 52%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `radial-gradient(circle at 72% 72%, ${c.glowSecondary} 0%, transparent 48%)`,
        }}
      />
      {!lite && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      {/* 月牙形发光（与中央日月星芒匹配） */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(
              ellipse 9.2% 13.4% at 51.1% 48.3%,
              ${c.glowPrimary} 0%,
              ${c.glowPrimary} 42%,
              transparent 78%
            ),
            radial-gradient(
              ellipse 6.6% 9.6% at 55.9% 48.5%,
              rgba(0,0,0,0.92) 0%,
              rgba(0,0,0,0.92) 68%,
              transparent 100%
            )
          `,
          backgroundBlendMode: "normal",
          opacity: 0.54,
        }}
      />
      {!lite && (
        <>
          <div
            className="card-back-holo pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background: `linear-gradient(
                118deg,
                transparent 0%,
                rgba(210, 228, 255, 0) 32%,
                rgba(245, 250, 255, 0.42) 44%,
                rgba(230, 205, 255, 0.32) 50%,
                rgba(255, 248, 225, 0.28) 56%,
                rgba(195, 238, 255, 0.3) 62%,
                transparent 74%
              )`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage: `repeating-linear-gradient(
                108deg,
                transparent 0px,
                transparent 3px,
                rgba(255, 255, 255, 0.06) 3px,
                rgba(200, 220, 255, 0.04) 4px,
                transparent 5px
              )`,
            }}
          />
        </>
      )}
    </>
  );
}
