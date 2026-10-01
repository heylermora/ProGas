import { normalizeTerritoryName } from './TerritoryService';

describe('normalizeTerritoryName', () => {
  it('matches common provider labels with catalogue names', () => {
    expect(normalizeTerritoryName('Provincia de San José')).toBe('San José');
    expect(normalizeTerritoryName('Cantón de Acosta')).toBe('Acosta');
    expect(normalizeTerritoryName('San José Province')).toBe('San José');
  });
});
