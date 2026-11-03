import { categoryMapPosition } from './mallLayout';
it.each([1, 3, 7, 8])('keeps %i stations inside the safe map area', count => {
  const positions = Array.from({ length: count }, (_, index) => categoryMapPosition(index, count));
  positions.forEach(([x, y]) => { expect(x).toBeGreaterThanOrEqual(16); expect(x).toBeLessThanOrEqual(84); expect(y).toBeGreaterThanOrEqual(16); expect(y).toBeLessThanOrEqual(72); });
});
it('distributes seven categories around the full ellipse rather than its first half', () => {
  const positions = Array.from({ length: 7 }, (_, index) => categoryMapPosition(index, 7));
  expect(positions.some(([x]) => x < 20)).toBe(true);
  expect(positions.some(([x]) => x > 80)).toBe(true);
  expect(positions.reduce((sum, [x]) => sum + x, 0) / 7).toBeCloseTo(50);
  expect(positions.reduce((sum, [,y]) => sum + y, 0) / 7).toBeCloseTo(44);
});
