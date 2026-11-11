/** Clockwise stations fill the entire ellipse, regardless of the category count. */
export function categoryMapPosition(index: number, total: number): [number, number] {
  const angle = index / Math.max(1, total) * Math.PI * 2 - Math.PI / 2;
  return [50 + Math.cos(angle) * 34, 44 + Math.sin(angle) * 28];
}
