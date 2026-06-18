// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Image, Text, Link, Stack, Badge, Button, AspectRatio, useColorModeValue } from '@chakra-ui/react';
import SponsorService from 'services/SponsorService';

const fallbackSponsors = {
  VIP: [1, 2, 3, 4].map((n) => ({ id: `vip-${n}`, name: `VIP ${n}`, type: 'VIP', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
  Premium: [1, 2, 3, 4].map((n) => ({ id: `premium-${n}`, name: `Premium ${n}`, type: 'Premium', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
  General: [1, 2, 3, 4].map((n) => ({ id: `general-${n}`, name: `General ${n}`, type: 'General', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
};

export default function SponsorStrip({ type, max, title }) {
  const [sponsors, setSponsors] = useState([]);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    SponsorService.getPublicByType(type, max)
      .then((data) => setSponsors(data.length ? data : fallbackSponsors[type].slice(0, max)))
      .catch(() => setSponsors(fallbackSponsors[type].slice(0, max)));
  }, [type, max]);

  return (
    <Box w="100%">
      <Text fontSize="2xl" fontWeight="800" mb="18px">{title}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: Math.min(max, 4) }} spacing="16px">
        {sponsors.slice(0, max).map((sponsor) => (
          <Box key={sponsor.id} bg={cardBg} p="18px" borderRadius="24px" boxShadow="md" border="1px solid" borderColor="gray.100">
            <Stack spacing="12px">
              <Badge w="fit-content" colorScheme={type === 'VIP' ? 'yellow' : type === 'Premium' ? 'purple' : 'green'}>{type}</Badge>
              {sponsor.logoUrl ? <Image src={sponsor.logoUrl} alt={sponsor.name} h="90px" objectFit="contain" /> : <Box h="90px" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>}
              <Text fontWeight="800">{sponsor.name}</Text>
              {sponsor.description && <Text color={muted} fontSize="sm">{sponsor.description}</Text>}
              {type === 'VIP' && sponsor.videoUrl && <AspectRatio ratio={16 / 9}><Box as="video" src={sponsor.videoUrl} controls maxH="160px" /></AspectRatio>}
              <Stack direction="row" flexWrap="wrap">
                {(sponsor.links || []).slice(0, type === 'General' ? 1 : 4).map((link, i) => <Button key={link} as={Link} href={link} isExternal size="sm" colorScheme="brand">Link {i + 1}</Button>)}
              </Stack>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
