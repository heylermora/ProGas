import React, { useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import { coordinatesToText, isCostaRicaCoordinate, mapsEmbedUrl, mapsSearchUrl } from 'utils/location';
import GeocodingService from 'services/GeocodingService';
import { ReverseGeocodeItem } from 'interfaces/ReverseGeocodeItem';

type DeviceLocationMapProps = {
  successMessage?: string;
  footnote?: string;
  coordinates?: string;
  addressQuery?: string;
  detectAddress?: boolean;
  onLocation?: (value: { coordinates: string; locationUrl: string; latitude: number; longitude: number; accuracyMeters?: number; detectedAddress?: ReverseGeocodeItem }) => void;
};

export default function DeviceLocationMap({ coordinates = '', addressQuery = '', detectAddress = false, onLocation, successMessage = 'Ubicación exacta agregada al pedido.', footnote = 'El GPS guarda el punto exacto, pero no cambia el pueblo ni las señas que seleccionaste.' }: DeviceLocationMapProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const query = coordinates || addressQuery;
  const embedUrl = useMemo(() => mapsEmbedUrl(query), [query]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Este dispositivo no permite obtener la ubicación automáticamente. Escribí las señas para continuar.');
      return;
    }

    setLoading(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isCostaRicaCoordinate(position.coords.latitude, position.coords.longitude)) {
          setMessage('La ubicación detectada está fuera de Costa Rica. Ingresá la dirección manualmente.');
          setLoading(false);
          return;
        }
        const nextCoordinates = coordinatesToText(position.coords.latitude, position.coords.longitude);
        const baseLocation = {
          coordinates: nextCoordinates,
          locationUrl: mapsSearchUrl(nextCoordinates),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        };
        if (!detectAddress) {
          onLocation?.(baseLocation);
          setMessage(successMessage);
          setLoading(false);
          return;
        }
        try {
          const detectedAddress = await GeocodingService.reverse(position.coords.latitude, position.coords.longitude);
          onLocation?.({ ...baseLocation, detectedAddress });
          setMessage('Ubicación encontrada. Revisá y corregí la dirección detectada antes de continuar.');
        } catch {
          onLocation?.(baseLocation);
          setMessage('Guardamos las coordenadas, pero no pudimos completar la dirección. Seleccionala manualmente.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage('No pudimos obtener la ubicación. Revisá permisos del navegador o continuá con las señas.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <Stack spacing="10px">
      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={{ base: '6px', md: '10px' }}>
        <Button size="md" px={{ base: 2, md: 4 }} leftIcon={loading ? <Spinner size="xs" /> : <MdMyLocation />} colorScheme="brand" onClick={requestLocation} isLoading={loading} loadingText="Ubicando">
          <Text as="span">Usar mi ubicación</Text>        </Button>
      </SimpleGrid>
      <Text fontSize="sm" color="gray.500">Solo necesitás aceptar el permiso de ubicación.</Text>
      {message && <Alert status={coordinates ? 'info' : 'warning'} borderRadius="12px"><AlertIcon />{message}</Alert>}
      {embedUrl && (
        <Box border="1px solid" borderColor="gray.200" borderRadius="16px" overflow="hidden" bg="gray.50">
          <Box as="iframe" title="Vista previa de ubicación en Google Maps" src={embedUrl} w="100%" h={{ base: '220px', md: '280px' }} border="0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Box>
      )}
      <Text fontSize="xs" color="gray.500">{footnote}</Text>
    </Stack>
  );
}
