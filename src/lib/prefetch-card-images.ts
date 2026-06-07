import { scheduleIdleTask } from "@/lib/runtime-performance";
import type { DrawnCard } from "@/types/tarot";

function faceUrl(image?: string) {
  if (!image?.match(/\.(png|jpe?g|webp|gif)(\?.*)?$/i)) return null;
  return image.split("?")[0] ?? image;
}

function loadFace(url: string) {
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

/** 进入揭示阶段时预加载牌面；前几张开牌优先，其余空闲时加载 */
export function prefetchCardFaces(cards: DrawnCard[], urgentCount = 4) {
  if (typeof window === "undefined") return;

  const urls: string[] = [];
  for (const drawn of cards) {
    const url = faceUrl(drawn.card?.image);
    if (url) urls.push(url);
  }

  urls.slice(0, urgentCount).forEach(loadFace);
  const rest = urls.slice(urgentCount);
  if (rest.length > 0) {
    scheduleIdleTask(() => rest.forEach(loadFace));
  }
}
