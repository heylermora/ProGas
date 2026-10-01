import { coordinatesToText, isCostaRicaCoordinate } from './location';

describe('location utilities', () => {
  it('accepts coordinates in Costa Rica and rejects coordinates outside the country bounds', () => {
    expect(isCostaRicaCoordinate(9.9333, -84.0833)).toBe(true);
    expect(isCostaRicaCoordinate(40.7128, -74.006)).toBe(false);
  });

  it('stores coordinates with consistent precision', () => {
    expect(coordinatesToText(9.93333333, -84.08333333)).toBe('9.933333,-84.083333');
  });
});
