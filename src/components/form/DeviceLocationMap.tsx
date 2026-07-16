// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, FormHelperText, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import { coordinatesToText, mapsEmbedUrl, mapsSearchUrl } from 'utils/location';

type DeviceLocationMapProps = {
  coordinates?: string;
  addressQuery?: string;
  onLocation?: (value: { coordinates: string; locationUrl: string }) => void;
};

export default function DeviceLocationMap({ coordinates = '', addressQuery = '', onLocation }: DeviceLocationMapProps) {
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
      (position) => {
        const nextCoordinates = coordinatesToText(position.coords.latitude, position.coords.longitude);
        onLocation?.({ coordinates: nextCoordinates, locationUrl: mapsSearchUrl(nextCoordinates) });
        setLoading(false);
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
        <Button size={{ base: 'sm', md: 'md' }} px={{ base: 2, md: 4 }} leftIcon={loading ? <Spinner size="xs" /> : <MdMyLocation />} colorScheme="brand" onClick={requestLocation} isLoading={loading} loadingText="Ubicando">
          <Text as="span">Usar mi ubicación</Text>        </Button>
      </SimpleGrid>
      <FormHelperText>Solo necesitás aceptar el permiso de ubicación.</FormHelperText>
      {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
      {embedUrl && (
        <Box border="1px solid" borderColor="gray.200" borderRadius="16px" overflow="hidden" bg="gray.50">
          <Box as="iframe" title="Vista previa de ubicación en Google Maps" src={embedUrl} w="100%" h={{ base: '220px', md: '280px' }} border="0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Box>
      )}
    </Stack>
  );
}
