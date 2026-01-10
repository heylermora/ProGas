// Map.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, VStack, Input, FormLabel, Checkbox } from '@chakra-ui/react';
import MapService, { mapboxgl, MapboxMap, MapboxMarker } from 'services/MapService';
import { LngLatTuple } from 'interfaces/ReverseGeocodeItem';
import 'mapbox-gl/dist/mapbox-gl.css';

type MapValue = {
  coords: LngLatTuple | null;
  address: string;
  isManualAddress: boolean;
};

type MapProps = {
  value?: MapValue;
  onChange?: (value: MapValue) => void;
};

const isValidCoords = (coords: any): coords is LngLatTuple => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number' &&
    coords[0] !== 0 &&
    coords[1] !== 0
  );
};

const Map: React.FC<MapProps> = ({ value, onChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);

  const [mapCenter, setMapCenter] = useState<LngLatTuple | null>(null);
  const [markerCoords, setMarkerCoords] = useState<LngLatTuple | null>(
    isValidCoords(value?.coords) ? value!.coords : null
  );
  const [address, setAddress] = useState<string>(value?.address ?? '');
  const [isManualAddress, setIsManualAddress] = useState<boolean>(
    value?.isManualAddress ?? false
  );

  /* ------------------------------------------------------------------ */
  /* Refs para evitar deps inestables                                    */
  /* ------------------------------------------------------------------ */
  const markerCoordsRef = useRef<LngLatTuple | null>(markerCoords);
  const addressRef = useRef<string>(address);
  const isManualAddressRef = useRef<boolean>(isManualAddress);

  useEffect(() => {
    markerCoordsRef.current = markerCoords;
  }, [markerCoords]);

  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    isManualAddressRef.current = isManualAddress;
  }, [isManualAddress]);

  /* ------------------------------------------------------------------ */
  /* Emit change estable                                                 */
  /* ------------------------------------------------------------------ */
  const emitChange = useCallback(
    (partial: Partial<MapValue> = {}) => {
      const next: MapValue = {
        coords: partial.coords ?? markerCoordsRef.current ?? null,
        address: partial.address ?? addressRef.current ?? '',
        isManualAddress:
          partial.isManualAddress ?? isManualAddressRef.current ?? false,
      };
      onChange?.(next);
    },
    [onChange]
  );

  /* ------------------------------------------------------------------ */
  /* Ubicación inicial                                                   */
  /* ------------------------------------------------------------------ */
  const valueCoords = value?.coords;
  const valueAddress = value?.address;
  const valueIsManual = value?.isManualAddress;

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const initial = await MapService.getInitialLocation();
      if (!isMounted) return;

      const initialCoords = isValidCoords(valueCoords)
        ? valueCoords
        : initial.marker ?? initial.center;

      setMapCenter(initial.center);
      setMarkerCoords(initialCoords);

      emitChange({
        coords: initialCoords,
        address: valueAddress ?? '',
        isManualAddress: valueIsManual ?? false,
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [emitChange, valueCoords, valueAddress, valueIsManual]);

  /* ------------------------------------------------------------------ */
  /* Crear mapa + marcador                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!mapCenter || !containerRef.current) return;
    if (mapRef.current) return;

    if (!mapboxgl.supported()) {
      console.error('[Map] Mapbox GL no es soportado por este navegador.');
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: mapCenter,
      zoom: 18,
      attributionControl: true,
    });
    mapRef.current = map;

    const markerInitial: LngLatTuple = markerCoordsRef.current ?? mapCenter;

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(markerInitial)
      .addTo(map);

    markerRef.current = marker;

    const onDragEnd = () => {
      const pos = marker.getLngLat();
      const lngLat: LngLatTuple = [pos.lng, pos.lat];
      setMarkerCoords(lngLat);
      emitChange({ coords: lngLat });
    };

    marker.on('dragend', onDragEnd);

    return () => {
      marker.off('dragend', onDragEnd);
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [mapCenter, emitChange]);

  /* ------------------------------------------------------------------ */
  /* Reverse geocode (automático)                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!markerCoords) return;
    if (isManualAddress) return;

    (async () => {
      const text = await MapService.getAddressFromCoords(markerCoords, {
        language: 'es',
        country: 'cr',
      });
      setAddress(text);
      emitChange({ coords: markerCoords, address: text });
    })();
  }, [markerCoords, isManualAddress, emitChange]);

  /* ------------------------------------------------------------------ */
  /* Si se desactiva manual, refrescar dirección                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isManualAddress && markerCoords) {
      (async () => {
        const text = await MapService.getAddressFromCoords(markerCoords, {
          language: 'es',
          country: 'cr',
        });
        setAddress(text);
        emitChange({ address: text, coords: markerCoords });
      })();
    }
  }, [isManualAddress, markerCoords, emitChange]);

  return (
    <Box height="auto">
      <VStack spacing={4} align="stretch" mb="16px">
        {!isManualAddress && (
          <>
            <Box mt="16px" borderRadius="md" overflow="hidden" boxShadow="sm">
              <div
                ref={containerRef}
                style={{ height: '200px', width: '100%' }}
                aria-label="Mapa interactivo con marcador arrastrable"
              />
            </Box>

            <Box>
              <FormLabel>Coordenadas</FormLabel>
              <Input
                value={MapService.formatCoordsLabel(markerCoords)}
                isReadOnly
                variant="auth"
              />
            </Box>
          </>
        )}

        <Box>
          <FormLabel>Dirección</FormLabel>
          <Input
            value={address || (!isManualAddress ? 'Obteniendo dirección...' : '')}
            isReadOnly={!isManualAddress}
            onChange={
              isManualAddress
                ? (e) => {
                    const v = e.target.value;
                    setAddress(v);
                    emitChange({ address: v });
                  }
                : undefined
            }
            placeholder={isManualAddress ? 'Digite la dirección manualmente' : ''}
            variant="auth"
          />
        </Box>

        <Box>
          <Checkbox
            isChecked={isManualAddress}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsManualAddress(checked);
              emitChange({ isManualAddress: checked });
            }}
          >
            Ingresar dirección manualmente
          </Checkbox>
        </Box>
      </VStack>
    </Box>
  );
};

export default Map;