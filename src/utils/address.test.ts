import { AddressItem } from 'interfaces/AddressItem';
import { formatDeliveryAddress, legacyCoordinates } from './address';

const address: AddressItem = {
  province: { code: '1', name: 'San José' },
  canton: { code: '12', name: 'Acosta' },
  district: { code: '01', name: 'San Ignacio' },
  locality: { name: 'Centro' },
  exactAddress: 'Casa azul frente al parque',
  additionalDirections: 'Llamar al llegar',
  captureSource: 'manual',
  catalogVersion: 'test',
};

describe('address utilities', () => {
  it('formats a complete delivery snapshot without losing territorial levels', () => {
    expect(formatDeliveryAddress(address)).toBe('San José, Acosta, San Ignacio, Centro, Casa azul frente al parque, Llamar al llegar');
  });

  it('reads valid legacy coordinates and rejects invalid values', () => {
    expect(legacyCoordinates('9.933333,-84.083333')).toEqual({ latitude: 9.933333, longitude: -84.083333 });
    expect(legacyCoordinates('sin coordenadas')).toBeUndefined();
  });
});
