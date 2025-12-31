import {ReverseGeocodeItem, InitialLocationItem, LngLatTuple} from '../interfaces/ReverseGeocodeItem';
import mapboxglLib, { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
  'pk.eyJ1Ijoiam9oZWxtb3JhIiwiYSI6ImNtNXJ0NjN3ZTAwZ2sybXB1cWwzc2JzeW4ifQ.orciFl97k7aSe8xg-N4Ttw';

if (!MAPBOX_TOKEN) {
  // Útil en desarrollo: loguear si faltan credenciales
  console.warn(
    '[MapService] Falta NEXT_PUBLIC_MAPBOX_TOKEN. El geocoding de Mapbox no funcionará.'
  );
}

mapboxglLib.accessToken = MAPBOX_TOKEN;

export const mapboxgl = mapboxglLib;
export type { MapboxMap, MapboxMarker };

const FALLBACK_LNG_LAT: LngLatTuple = [-83.753428, 9.748917]; // [lng, lat] Costa Rica
const BASE_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Ubicación inicial:
 * - Si hay geolocalización → center y marker en coords reales.
 * - Si NO hay geolocalización → center en fallback y marker = null (no coords por defecto).
 */
async function getInitialLocation(): Promise<InitialLocationItem> {
  if (typeof window === 'undefined') {
    return {
      center: FALLBACK_LNG_LAT,
      marker: null,
    };
  }

  if (!('geolocation' in navigator)) {
    console.warn('[MapService] Geolocalización no soportada. Usando centro por defecto.');
    return {
      center: FALLBACK_LNG_LAT,
      marker: null,
    };
  }

  return new Promise<InitialLocationItem>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const lngLat: LngLatTuple = [longitude, latitude];

        resolve({
          center: lngLat,
          marker: lngLat,
        });
      },
      (error) => {
        console.error('[MapService] Error al obtener la ubicación:', error);
        resolve({
          center: FALLBACK_LNG_LAT,
          marker: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Label de coordenadas para el input.
 */
function formatCoordsLabel(coords: LngLatTuple | null): string {
  if (!coords) return 'Obteniendo coordenadas...';
  return `Lat: ${coords[1].toFixed(6)}, Lng: ${coords[0].toFixed(6)}`;
}

/**
 * Reverse geocoding simple con Mapbox.
 */
async function reverseGeocode(
  lng: number,
  lat: number,
  options?: {
    language?: string;
    country?: string;
  }
): Promise<ReverseGeocodeItem | null> {
  if (!MAPBOX_TOKEN) return null;

  const language = options?.language ?? 'es';
  const country = options?.country ?? 'cr';

  const url = `${BASE_GEOCODING_URL}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=${language}&country=${country}&limit=1`;
  console.log('[MapService] reverseGeocode URL:', url);
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('[MapService] Error en reverseGeocode:', resp.status, resp.statusText);
      return null;
    }

    const data = await resp.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];

    const context: any[] = feature.context ?? [];
    const props = [...context];

    if (feature.properties) {
      props.push(feature.properties);
    }

    const getByType = (type: string): string | undefined => {
      const item = props.find((c) => c.id?.startsWith?.(type));
      return item?.text || item?.name;
    };

    const neighborhood = getByType('neighborhood');
    const district = getByType('place');
    const county = getByType('district') || getByType('locality');
    const province = getByType('region');
    const countryName = getByType('country');

    const fullAddress: string = feature.place_name || '';

    return {
      fullAddress,
      neighborhood,
      district,
      county,
      province,
      country: countryName,
      raw: data,
    };
  } catch (err) {
    console.error('[MapService] Excepción en reverseGeocode:', err);
    return null;
  }
}

/**
 * Helper que ya devuelve el texto listo para pintar en el input de Dirección.
 */
async function getAddressFromCoords(
  coords: LngLatTuple,
  options?: {
    language?: string;
    country?: string;
  }
): Promise<string> {
  const [lng, lat] = coords;
  const result = await reverseGeocode(lng, lat, options);

  if (!result) {
    return 'No se pudo obtener la dirección para estas coordenadas.';
  }

  const parts = [
    result.neighborhood,
    result.district,
    result.county,
    result.province,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : result.fullAddress;
}

const MapService = {
  getInitialLocation,
  formatCoordsLabel,
  reverseGeocode,
  getAddressFromCoords,
};

export default MapService;