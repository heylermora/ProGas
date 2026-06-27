// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdLink } from 'react-icons/md';
import SponsorService from 'services/SponsorService';

const fallbackSponsors = {
  VIP: [1, 2, 3, 4].map((n) => ({ id: `vip-${n}`, name: `Espacio VIP ${n}`, type: 'VIP', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
  Premium: [1, 2, 3, 4].map((n) => ({ id: `premium-${n}`, name: `Espacio Premium ${n}`, type: 'Premium', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
  General: [1, 2, 3, 4].map((n) => ({ id: `general-${n}`, name: `Espacio General ${n}`, type: 'General', active: true, order: n, logoUrl: '', links: [], description: 'Espacio disponible' })),
};

const getLinkMeta = (url = '') => {
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com')) return { label: 'Facebook', icon: FaFacebookF, bg: '#1877F2' };
  if (lower.includes('instagram.com')) return { label: 'Instagram', icon: FaInstagram, bg: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)' };
  if (lower.includes('whatsapp.com') || lower.includes('wa.me')) return { label: 'WhatsApp', icon: FaWhatsapp, bg: '#25D366' };
  if (lower.includes('tiktok.com')) return { label: 'TikTok', icon: FaTiktok, bg: '#111111' };
  if (lower.startsWith('mailto:') || lower.includes('@')) return { label: 'Correo', icon: MdEmail, bg: '#F97316' };
  if (lower.includes('http')) return { label: 'Sitio web', icon: FaGlobe, bg: '#2563EB' };
  return { label: 'Link', icon: MdLink, bg: '#64748B' };
};

function SponsorLinkBubbles({ links = [], max = 4 }) {
  const cleanLinks = links.filter(Boolean).slice(0, max);
  if (!cleanLinks.length) return null;

  return (
    <HStack spacing="8px" flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }} pt="4px">
      {cleanLinks.map((link, index) => {
        const meta = getLinkMeta(link);
        const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;
        return (
          <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
            <IconButton
              as={Link}
              href={href}
              isExternal={!href.startsWith('mailto:')}
              aria-label={meta.label}
              icon={<Icon as={meta.icon} w="18px" h="18px" />}
              sx={{ background: meta.bg }}
              color="white"
              borderRadius="full"
              w="42px"
              h="42px"
              minW="42px"
              boxShadow="0 12px 22px rgba(15, 23, 42, .22)"
              border="2px solid"
              borderColor="white"
              transition="transform .2s ease, filter .2s ease"
              _hover={{ transform: 'translateY(-3px) scale(1.06)', filter: 'brightness(1.05)', textDecoration: 'none' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
            />
          </Tooltip>
        );
      })}
    </HStack>
  );
}

export default function SponsorStrip({ type, max, title, offset = 0, sponsors: injectedSponsors, previewSponsor }) {
  const [sponsors, setSponsors] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');
  const tabBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const activeTabBg = useColorModeValue('brand.500', 'brand.300');

  useEffect(() => {
    if (previewSponsor) {
      setSponsors([previewSponsor]);
      setSelectedId(previewSponsor.id || 'preview');
      return;
    }

    if (injectedSponsors) {
      const activeSponsors = injectedSponsors.filter((sponsor) => sponsor.active !== false).slice(offset, offset + max);
      setSponsors(activeSponsors);
      setSelectedId(activeSponsors[0]?.id || '');
      return;
    }

    SponsorService.getPublicByType(type, max + offset)
      .then((data) => {
        const visible = (data.length ? data : fallbackSponsors[type]).filter((sponsor) => sponsor.active !== false).slice(offset, offset + max);
        setSponsors(visible);
        setSelectedId(visible[0]?.id || '');
      })
      .catch(() => {
        const fallback = fallbackSponsors[type].slice(0, max);
        setSponsors(fallback);
        setSelectedId(fallback[0]?.id || '');
      });
  }, [type, max, offset, injectedSponsors, previewSponsor]);

  const visibleSponsors = useMemo(() => sponsors.filter((sponsor) => sponsor.active !== false), [sponsors]);
  const selectedSponsor = visibleSponsors.find((sponsor) => sponsor.id === selectedId) || visibleSponsors[0];
  const linkMax = selectedSponsor?.type === 'General' || type === 'General' ? 1 : 4;
  const columns = { base: 1, md: selectedSponsor?.videoUrl && selectedSponsor?.type === 'VIP' ? 2 : 1 };

  if (!selectedSponsor) return null;

  return (
    <Box w="100%">
      {title && <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" mb={{ base: '14px', md: '18px' }}>{title}</Text>}

      {visibleSponsors.length > 1 && (
        <HStack spacing="10px" overflowX="auto" pb="10px" mb="14px" align="center">
          {visibleSponsors.map((sponsor) => {
            const isSelected = sponsor.id === selectedSponsor.id;
            return (
              <Button
                key={sponsor.id}
                onClick={() => setSelectedId(sponsor.id)}
                size="sm"
                borderRadius="full"
                flexShrink={0}
                bg={isSelected ? activeTabBg : tabBg}
                color={isSelected ? 'white' : muted}
                _hover={{ bg: isSelected ? activeTabBg : 'gray.200' }}
              >
                {sponsor.name}
              </Button>
            );
          })}
        </HStack>
      )}

      <Box bg={cardBg} p={{ base: '14px', md: '18px' }} borderRadius={{ base: '18px', md: '24px' }} boxShadow="md" border="1px solid" borderColor={borderColor} minW="0">
        <SimpleGrid columns={columns} spacing={{ base: '14px', md: '18px' }} alignItems="center">
          <Stack spacing="12px" h="100%" align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }}>
            <Badge w="fit-content" colorScheme={selectedSponsor.type === 'VIP' ? 'yellow' : selectedSponsor.type === 'Premium' ? 'purple' : 'green'}>
              {selectedSponsor.type || type}
            </Badge>
            {selectedSponsor.logoUrl ? (
              <Image src={selectedSponsor.logoUrl} alt={selectedSponsor.name} h={{ base: '88px', md: '108px' }} objectFit="contain" />
            ) : (
              <Box h={{ base: '88px', md: '108px' }} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
            )}
            <Text fontWeight="800" fontSize={{ base: 'lg', md: 'xl' }} noOfLines={2}>{selectedSponsor.name}</Text>
            {selectedSponsor.description && <Text color={muted} fontSize="sm" noOfLines={3}>{selectedSponsor.description}</Text>}
            <SponsorLinkBubbles links={selectedSponsor.links} max={linkMax} />
          </Stack>
          {selectedSponsor.type === 'VIP' && selectedSponsor.videoUrl && (
            <AspectRatio ratio={16 / 9} w="100%">
              <Box as="video" src={selectedSponsor.videoUrl} controls borderRadius="18px" overflow="hidden" />
            </AspectRatio>
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
