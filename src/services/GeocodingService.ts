import { ReverseGeocodeItem } from 'interfaces/ReverseGeocodeItem';

const API = process.env.REACT_APP_GEOCODING_API_URL || 'https://nominatim.openstreetmap.org';

type NominatimResponse = {
  place_id?: string | number;
  display_name?: string;
  type?: string;
  importance?: number;
  address?: Record<string, string>;
};

export const normalizeReverseGeocode = (payload: NominatimResponse): ReverseGeocodeItem => {
  const address = payload.address || {};
  return {
    fullAddress: payload.display_name || '',
    neighborhood: address.village || address.town || address.hamlet || address.suburb || address.neighbourhood || address.city,
    district: address.city_district || address.district,
    county: address.county || address.municipality,
    province: address.state,
    country: address.country,
    provider: 'OpenStreetMap Nominatim',
    providerPlaceId: payload.place_id == null ? undefined : String(payload.place_id),
    confidence: payload.importance,
    precision: payload.type,
  };
};

const GeocodingService = {
  reverse: async (latitude: number, longitude: number) => {
    const params = new URLSearchParams({ format: 'jsonv2', lat: String(latitude), lon: String(longitude), addressdetails: '1', 'accept-language': 'es' });
    const response = await fetch(`${API}/reverse?${params.toString()}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('No se pudo reconocer la dirección de esta ubicación.');
    return normalizeReverseGeocode(await response.json());
  },
};

export default GeocodingService;
