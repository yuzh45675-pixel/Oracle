/** 牌阵视觉校正：实测整体偏右下，向左上补偿 */

export const SPREAD_CENTER_BIAS = {
  mobile: { x: -18, y: -22 },
  desktop: { x: -44, y: -36 },
} as const;

/** 牌桌可视区域裁切（去掉左上多余空白，等效把牌阵往中间推） */
export const SPREAD_TABLE_CROP = {
  mobile: { top: 18, left: 16 },
  desktop: { top: 36, left: 48 },
} as const;

export function spreadCenterBias(containerWidth: number) {
  return containerWidth < 768
    ? SPREAD_CENTER_BIAS.mobile
    : SPREAD_CENTER_BIAS.desktop;
}

export function spreadTableCrop(isMobile: boolean) {
  return isMobile ? SPREAD_TABLE_CROP.mobile : SPREAD_TABLE_CROP.desktop;
}
