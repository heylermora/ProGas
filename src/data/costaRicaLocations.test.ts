import { serviceAreaLocations } from './costaRicaLocations';

describe('Acosta locality catalogue', () => {
  const acosta = serviceAreaLocations['San José'].Acosta;

  it('contains only selectable catalogue values for each district', () => {
    expect(Object.keys(acosta)).toEqual(['San Ignacio', 'Guaitil', 'Palmichal', 'Cangrejal', 'Sabanillas']);
    expect(acosta['San Ignacio']).toContain('Aguablanca (parte)');
    expect(acosta.Guaitil).toContain('Bajo Arias');
    expect(acosta.Palmichal).toContain('Bajos de Jorco');
    expect(acosta.Cangrejal).toContain('Perpetuo Socorro');
    expect(acosta.Sabanillas).toContain('Zoncuano');
  });
});
