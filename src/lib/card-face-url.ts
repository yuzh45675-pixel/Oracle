/** 牌面资源 URL：揭示阶段用 ritual WebP，其余场景用原图 */

export function cardFaceBasename(image?: string) {
  if (!image?.match(/\.(png|jpe?g|webp|gif)(\?.*)?$/i)) return null;
  const path = image.split("?")[0] ?? image;
  const file = path.split("/").pop();
  if (!file) return null;
  return file.replace(/\.(png|jpe?g|webp|gif)$/i, "");
}

export function fullFaceUrl(image?: string) {
  if (!image) return null;
  return image.split("?")[0] ?? image;
}

/** 牌阵揭示 / 翻牌：优先轻量 WebP（见 scripts/generate-ritual-card-thumbs.mjs） */
export function ritualFaceUrl(image?: string) {
  const base = cardFaceBasename(image);
  if (!base) return null;
  return `/cards/ritual/${base}.webp`;
}

export function resolveFaceUrl(
  image: string | undefined,
  variant: "full" | "ritual",
) {
  if (!image) return null;
  if (variant === "ritual") {
    return ritualFaceUrl(image) ?? fullFaceUrl(image);
  }
  return fullFaceUrl(image);
}
