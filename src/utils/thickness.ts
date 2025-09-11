export const PAGES_PER_CM = 280;   // 1cm 당 페이지 수 (조정 가능)
export const PX_PER_CM     = 18;   // 1cm를 몇 px로 표현할지
export const DISPLAY_SCALE = 1.4;  // 전체 배율(살짝 크게 보이도록)
export const MIN_CM        = 0.6;  // 최소 0.6cm 가정(초슬림 보정)
export const MIN_PX        = 14;   // 최소 가독 폭(px)
export const MAX_PX        = 52;   // 너무 두꺼워 보이지 않게 상한

export function pagesToCm(pages?: number): number {
  if (!pages || pages <= 0) return MIN_CM;
  const cm = pages / PAGES_PER_CM;
  return Math.max(MIN_CM, cm);
}

export function cmToPx(cm: number): number {
  const px = Math.round(cm * PX_PER_CM * DISPLAY_SCALE);
  return Math.max(MIN_PX, Math.min(MAX_PX, px));
}

export function pagesToWidth(pages?: number): number {
  return cmToPx(pagesToCm(pages));
}