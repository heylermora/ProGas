import React from 'react';
import { Badge, Box, Button, Heading, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { PublicCard, PublicPage } from './PublicPage';

const packages = [
  {
    name: 'VIP',
    price: '₡15.000 / mes',
    badge: 'Máximo 4 espacios',
    features: ['Página principal', '2 posiciones arriba y 2 abajo', 'Logo', 'Hasta 4 links', 'Video publicitario de hasta 30 segundos'],
  },
  {
    name: 'Premium',
    price: '₡10.000 / mes',
    badge: 'Máximo 8 espacios',
    features: ['Página de datos del cliente', '4 posiciones arriba y 4 abajo', 'Logo', 'Hasta 4 links'],
  },
  {
    name: 'General',
    price: '₡5.000 / mes',
    badge: 'Máximo 12 espacios',
    features: ['Página de productos', '4 posiciones arriba y 8 abajo', 'Logo', '1 link'],
  },
];

export default function SponsorshipPackages() {
  const muted = useColorModeValue('gray.600', 'gray.300');
  return (
    <PublicPage title="Paquetes de patrocinadores" description="Espacios publicitarios disponibles para negocios que quieran aparecer en el flujo público de Gas Memo." maxW="1100px">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="18px">
        {packages.map((item) => (
          <PublicCard key={item.name}>
            <Stack spacing="14px" minH="100%">
              <Badge w="fit-content" colorScheme={item.name === 'VIP' ? 'yellow' : item.name === 'Premium' ? 'purple' : 'green'}>{item.badge}</Badge>
              <Heading fontSize="2xl">{item.name}</Heading>
              <Text fontSize="3xl" fontWeight="900">{item.price}</Text>
              <Stack spacing="8px">
                {item.features.map((feature) => <Text key={feature} color={muted}>• {feature}</Text>)}
              </Stack>
            </Stack>
          </PublicCard>
        ))}
      </SimpleGrid>
      <Box mt="20px">
        <Button as={RLink} to="/" variant="outline">Volver al inicio</Button>
      </Box>
    </PublicPage>
  );
}
