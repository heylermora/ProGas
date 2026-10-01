import { normalizeReverseGeocode } from './GeocodingService';

describe('normalizeReverseGeocode', () => {
  it('normalizes Costa Rican territorial fields without retaining the raw provider payload', () => {
    const result = normalizeReverseGeocode({
      place_id: 42,
      display_name: 'Centro, San Ignacio, Acosta, San José, Costa Rica',
      type: 'village',
      importance: 0.55,
      address: {
        village: 'Centro',
        district: 'San Ignacio',
        county: 'Acosta',
        state: 'San José',
        country: 'Costa Rica',
      },
    });

    expect(result).toEqual({
      fullAddress: 'Centro, San Ignacio, Acosta, San José, Costa Rica',
      neighborhood: 'Centro',
      district: 'San Ignacio',
      county: 'Acosta',
      province: 'San José',
      country: 'Costa Rica',
      provider: 'OpenStreetMap Nominatim',
      providerPlaceId: '42',
      confidence: 0.55,
      precision: 'village',
    });
    expect(result).not.toHaveProperty('raw');
  });
});
