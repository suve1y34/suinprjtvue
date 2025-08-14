export function pagesToWidth(pages?: number): number {
  const basePages = 240; // 240p - 16px 기준
  const baseWidth = 16;
  const p = pages ?? basePages;
  const w = (p / basePages) * baseWidth;
  return Math.min(36, Math.max(8, Math.round(w)));
}