"use client";

import { useTheme } from "@/context/ThemeContext";
import type { CardBackDetail } from "@/lib/ritual-performance";
import { CardBackMatteSurface } from "./CardBackMatteSurface";
import { LiteCardBackArt } from "./LiteCardBackArt";
import { OracleEyeCardBackArt } from "./OracleEyeCardBackArt";

/** 磨砂黑底 + 主题色线描星图 + 中央全知之眼（接近 ARCANA ARCHIVE 原稿） */
export function ThemedCardBack({
  reversed,
  orbitSpin = false,
  detail = "full",
}: {
  reversed?: boolean;
  orbitSpin?: boolean;
  detail?: CardBackDetail;
}) {
  const { theme } = useTheme();
  const lite = detail === "lite";

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl"
      style={{ transform: reversed ? "rotate(180deg)" : undefined }}
    >
      <CardBackMatteSurface theme={theme} lite={lite} />
      {lite ? (
        <LiteCardBackArt theme={theme} />
      ) : (
        <OracleEyeCardBackArt theme={theme} orbitSpin={orbitSpin} />
      )}
    </div>
  );
}
