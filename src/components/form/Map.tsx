import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, Input, FormLabel } from '@chakra-ui/react';
import mapboxgl, { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ⚠️ Usa tu token desde una env var si es posible
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
  'pk.eyJ1Ijoiam9oZWxtb3JhIiwiYSI6ImNtNXJ0NjN3ZTAwZ2sybXB1cWwzc2JzeW4ifQ.orciFl97k7aSe8xg-N4Ttw';

const DEFAULT_LNG_LAT: [number, number] = [-83.753428, 9.748917]; // [lng, lat] Costa Rica

const Map: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Guardar instancia del mapa y marcador para evitar re-inicialización (React 18 StrictMode)
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);

  // 1) Obtener ubicación del usuario (una sola vez)
  useEffect(() => {
    // Evitar ejecutar en SSR
    if (typeof window === 'undefined') {
      setUserLocation(DEFAULT_LNG_LAT);
      setMarkerCoords(DEFAULT_LNG_LAT);
      return;
    }

    const setDefault = () => {
      setUserLocation(DEFAULT_LNG_LAT);
      setMarkerCoords(DEFAULT_LNG_LAT);
    };

    if (!('geolocation' in navigator)) {
      console.warn('Geolocalización no soportada. Usando ubicación por defecto.');
      setDefault();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const lngLat: [number, number] = [longitude, latitude];
        setUserLocation(lngLat);
        setMarkerCoords(lngLat);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        setDefault();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }, []);

  // 2) Inicializar mapa cuando tengamos userLocation y el contenedor
  useEffect(() => {
    if (!userLocation || !containerRef.current) return;
    if (mapRef.current) return; // Ya se inicializó (evita doble creación en StrictMode)

    // Opcional: verificar soporte WebGL de Mapbox
    if (!mapboxgl.supported()) {
      console.error('Mapbox GL no es soportado por este navegador.');
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation,
      zoom: 17,
      attributionControl: true,
    });
    mapRef.current = map;

    // Controles de navegación (zoom/rotación)
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Crear marcador arrastrable
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(userLocation)
      .addTo(map);

    markerRef.current = marker;

    const onDragEnd = () => {
      const pos = marker.getLngLat();
      const lngLat: [number, number] = [pos.lng, pos.lat];
      setMarkerCoords(lngLat);
      // console.log(`Lat: ${lngLat[1]}, Lng: ${lngLat[0]}`);
    };

    marker.on('dragend', onDragEnd);

    // Limpieza al desmontar
    return () => {
      marker.off('dragend', onDragEnd);
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [userLocation]);

  return (
    <Box height="auto">
      <VStack spacing={4} align="stretch" mb="16px">
        <Box mt="16px" borderRadius="md" overflow="hidden" boxShadow="sm">
          <div
            ref={containerRef}
            style={{ height: '300px', width: '100%' }}
            aria-label="Mapa interactivo con marcador arrastrable"
          />
        </Box>

        <Box>
          <FormLabel>Coordenadas</FormLabel>
          <Input
            value={
              markerCoords
                ? `Lat: ${markerCoords[1].toFixed(6)}, Lng: ${markerCoords[0].toFixed(6)}`
                : 'Obteniendo coordenadas...'
            }
            isReadOnly
            variant="filled" // evita usar una variante personalizada inexistente ("auth")
          />
        </Box>
      </VStack>
    </Box>
  );
};

export default Map;