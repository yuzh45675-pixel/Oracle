import { resolveFaceUrl } from "@/lib/card-face-url";
import type { DrawnCard } from "@/types/tarot";

function loadFace(url: string) {
  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  img.src = url;
}

function loadFaceUrgent(url: string) {
  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "high";
  img.src = url;
}

/** 进入揭示阶段：立即预加载全部 ritual 缩略图 */
export function prefetchCardFaces(
  cards: DrawnCard[],
  variant: "ritual" | "full" = "ritual",
) {
  if (typeof window === "undefined") return;
  for (const drawn of cards) {
    const url = resolveFaceUrl(drawn.card?.image, variant);
    if (url) loadFace(url);
  }
}

/** 翻下一张前优先加载当前 / 下一张 */
export function prefetchRevealBatch(
  cards: DrawnCard[],
  activeIndex: number,
  variant: "ritual" | "full" = "ritual",
) {
  if (typeof window === "undefined") return;
  const order = [activeIndex, activeIndex + 1, activeIndex + 2];
  const seen = new Set<string>();
  for (const i of order) {
    const drawn = cards[i];
    const url = resolveFaceUrl(drawn?.card?.image, variant);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    loadFaceUrgent(url);
  }
}
