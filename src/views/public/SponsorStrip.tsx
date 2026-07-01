// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  AspectRatio,
  Badge,
  Box,
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
import { Link as RLink } from 'react-router-dom';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdAddBusiness, MdEmail, MdLink } from 'react-icons/md';
import SponsorService from 'services/SponsorService';


const getVideoEmbedSrc = (value = '') => {
  if (!value) return '';
  const iframeSrc = value.match(/src=["']([^"']+)["']/i)?.[1];
  return iframeSrc || value;
};

const shouldRenderIframeVideo = (value = '') => {
  const src = getVideoEmbedSrc(value).toLowerCase();
  return value.toLowerCase().includes('<iframe') || src.includes('facebook.com/plugins/video') || src.includes('youtube.com/embed') || src.includes('player.vimeo.com');
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

const SPONSOR_CAPACITY = { VIP: 4, Premium: 8, General: 12 };

const makeAvailableSponsor = (type, index) => ({
  id: `available-${type}-${index}`,
  type,
  name: 'Disponible',
  description: 'Reservá este espacio publicitario para que tu negocio aparezca aquí.',
  isAvailable: true,
  active: true,
});

function SponsorLogoHub({ sponsor, links = [], max = 4, muted }) {
  const [isOpen, setIsOpen] = useState(false);
  const cleanLinks = links.filter(Boolean).slice(0, max);
  const hasLinks = cleanLinks.length > 0;

  return (
    <Box position="relative" w="100%" display="flex" justifyContent="center" py={hasLinks ? '18px' : '0px'}>
      <Box
        as={hasLinks ? 'button' : 'div'}
        type={hasLinks ? 'button' : undefined}
        aria-label={isOpen ? `Ocultar links de ${sponsor.name}` : `Mostrar links de ${sponsor.name}`}
        aria-expanded={hasLinks ? isOpen : undefined}
        onClick={hasLinks ? () => setIsOpen((current) => !current) : undefined}
        position="relative"
        borderRadius="22px"
        p="8px"
        transition="transform .2s ease, filter .2s ease"
        cursor={hasLinks ? 'pointer' : 'default'}
        _hover={hasLinks ? { transform: 'translateY(-2px) scale(1.01)', filter: 'drop-shadow(0 12px 20px rgba(15, 23, 42, .18))' } : undefined}
        _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '4px' }}
      >
        {sponsor.logoUrl ? (
          <Image src={sponsor.logoUrl} alt={sponsor.name} h={{ base: '88px', md: '108px' }} objectFit="contain" pointerEvents="none" />
        ) : (
          <Box h={{ base: '88px', md: '108px' }} minW={{ base: '180px', md: '220px' }} borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
        )}
      </Box>

      {cleanLinks.map((link, index) => {
        const meta = getLinkMeta(link);
        const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;
        const positions = [
          { top: '0px', left: '8%' },
          { top: '0px', right: '8%' },
          { bottom: '0px', left: '12%' },
          { bottom: '0px', right: '12%' },
        ];

        return (
          <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
            <IconButton
              as={Link}
              href={href}
              isExternal={!href.startsWith('mailto:')}
              aria-label={meta.label}
              icon={<Icon as={meta.icon} w="18px" h="18px" />}
              position="absolute"
              {...positions[index % positions.length]}
              sx={{ background: meta.bg }}
              color="white"
              borderRadius="full"
              w="42px"
              h="42px"
              minW="42px"
              boxShadow="0 12px 22px rgba(15, 23, 42, .22)"
              border="2px solid"
              borderColor="white"
              opacity={isOpen ? 1 : 0}
              visibility={isOpen ? 'visible' : 'hidden'}
              transform={isOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 10px, 0) scale(.65)'}
              transition={`all .25s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 45 : 0}ms`}
              _hover={{ transform: 'translate3d(0, -3px, 0) scale(1.07)', filter: 'brightness(1.05)', textDecoration: 'none' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default function SponsorStrip({ type, max, title, offset = 0, sponsors: injectedSponsors, previewSponsor }) {
  const [sponsors, setSponsors] = useState([]);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  useEffect(() => {
    if (previewSponsor) {
      setSponsors([previewSponsor]);
      return;
    }

    if (injectedSponsors) {
      const activeSponsors = injectedSponsors.filter((sponsor) => sponsor.active !== false).slice(offset, offset + max);
      setSponsors(activeSponsors);
      return;
    }

    SponsorService.getPublicByType(type, max + offset)
      .then((data) => {
        const visible = data.filter((sponsor) => sponsor.active !== false).slice(offset, offset + max);
        setSponsors(visible);
      })
      .catch(() => setSponsors([]));
  }, [type, max, offset, injectedSponsors, previewSponsor]);

  const visibleSponsors = sponsors.filter((sponsor) => sponsor.active !== false);
  const slotCount = Math.min(max, Math.max(0, (SPONSOR_CAPACITY[type] || max) - offset));
  const sponsorsWithAvailableSlots = [
    ...visibleSponsors,
    ...Array.from({ length: Math.max(slotCount - visibleSponsors.length, 0) }, (_, index) => makeAvailableSponsor(type, offset + visibleSponsors.length + index + 1)),
  ];
  const columns = { base: 1, sm: Math.min(slotCount || max, 2), lg: Math.min(slotCount || max, 3), xl: Math.min(slotCount || max, 4) };

  const renderAvailableCard = (sponsor) => (
    <Box
      key={sponsor.id}
      as={RLink}
      to="/sponsors/packages"
      role="group"
      bg={cardBg}
      p={{ base: '16px', md: '18px' }}
      borderRadius={{ base: '18px', md: '24px' }}
      boxShadow="md"
      border="1px dashed"
      borderColor="brand.300"
      minW="0"
      minH={{ base: '230px', md: '260px' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      position="relative"
      overflow="hidden"
      transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: 'repeating-linear-gradient(135deg, rgba(56, 161, 105, .10) 0px, rgba(56, 161, 105, .10) 12px, rgba(255,255,255,.28) 12px, rgba(255,255,255,.28) 24px)',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: '10px',
        borderRadius: { base: '14px', md: '20px' },
        border: '1px solid',
        borderColor: 'whiteAlpha.700',
        pointerEvents: 'none',
      }}
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', borderColor: 'brand.500', textDecoration: 'none' }}
      _focusVisible={{ outline: '3px solid', outlineColor: 'brand.300', outlineOffset: '4px' }}
    >
      <Stack spacing="12px" position="relative" zIndex={1} align="center">
        <Box w="66px" h="66px" borderRadius="full" bg="brand.50" color="brand.500" display="flex" alignItems="center" justifyContent="center" _groupHover={{ transform: 'scale(1.06)' }} transition="transform .2s ease">
          <Icon as={MdAddBusiness} w="34px" h="34px" />
        </Box>
        <Badge colorScheme={type === 'VIP' ? 'yellow' : type === 'Premium' ? 'purple' : 'green'} fontSize="0.78rem">{type}</Badge>
        <Text fontWeight="900" fontSize={{ base: 'xl', md: '2xl' }} color="brand.600">Disponible</Text>
        <Text color={muted} fontSize={{ base: 'sm', md: 'md' }} maxW="230px">Tocá para ver paquetes y reservar este espacio.</Text>
      </Stack>
    </Box>
  );

  const renderSponsorCard = (sponsor) => {
    if (sponsor.isAvailable) return renderAvailableCard(sponsor);
    const linkMax = sponsor?.type === 'General' || type === 'General' ? 1 : 4;
    const videoColumns = { base: 1, md: sponsor?.videoUrl && sponsor?.type === 'VIP' ? 2 : 1 };

    return (
      <Box key={sponsor.id} bg={cardBg} p={{ base: '14px', md: '18px' }} borderRadius={{ base: '18px', md: '24px' }} boxShadow="md" border="1px solid" borderColor={borderColor} minW="0">
        <SimpleGrid columns={videoColumns} spacing={{ base: '14px', md: '18px' }} alignItems="center">
          <Stack spacing="12px" h="100%" align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }}>
            <Badge w="fit-content" colorScheme={sponsor.type === 'VIP' ? 'yellow' : sponsor.type === 'Premium' ? 'purple' : 'green'}>
              {sponsor.type || type}
            </Badge>
            <SponsorLogoHub sponsor={sponsor} links={sponsor.links} max={linkMax} muted={muted} />
            <Text fontWeight="800" fontSize={{ base: 'lg', md: 'xl' }} noOfLines={2}>{sponsor.name}</Text>
            {sponsor.description && <Text color={muted} fontSize="sm" noOfLines={3}>{sponsor.description}</Text>}
          </Stack>
          {sponsor.type === 'VIP' && sponsor.videoUrl && (
            <AspectRatio ratio={16 / 9} w="100%">
              {shouldRenderIframeVideo(sponsor.videoUrl) ? (
                <Box
                  as="iframe"
                  src={getVideoEmbedSrc(sponsor.videoUrl)}
                  title={`Video de ${sponsor.name}`}
                  border="0"
                  borderRadius="18px"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <Box as="video" src={sponsor.videoUrl} controls borderRadius="18px" overflow="hidden" />
              )}
            </AspectRatio>
          )}
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <Box w="100%">
      {title && <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" mb={{ base: '14px', md: '18px' }}>{title}</Text>}
      {previewSponsor ? renderSponsorCard(visibleSponsors[0]) : (
        <SimpleGrid columns={columns} spacing={{ base: '12px', md: '16px' }}>
          {sponsorsWithAvailableSlots.map(renderSponsorCard)}
        </SimpleGrid>
      )}
    </Box>
  );
}
