// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  AspectRatio,
  Box,
  Icon,
  IconButton,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdAddBusiness, MdClose, MdEmail, MdLink, MdPlayCircleFilled, MdShare } from 'react-icons/md';
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
    <Box position="relative" w="100%" display="flex" justifyContent="center" py={hasLinks ? '10px' : '0px'}>
      <Box position="relative" borderRadius="22px" p={{ base: '4px', md: '6px' }}>
        {sponsor.logoUrl ? (
          <Image src={sponsor.logoUrl} alt={sponsor.name} h={{ base: '42px', md: '64px' }} maxW="100%" objectFit="contain" pointerEvents="none" />
        ) : (
          <Box h={{ base: '42px', md: '64px' }} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
        )}
      </Box>

      {hasLinks && (
        <IconButton
          type="button"
          aria-label={isOpen ? `Ocultar redes de ${sponsor.name}` : `Ver redes de ${sponsor.name}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          icon={<Icon as={isOpen ? MdClose : MdShare} w={{ base: '16px', md: '18px' }} h={{ base: '16px', md: '18px' }} />}
          position="absolute"
          right={{ base: '8px', md: '14px' }}
          bottom={{ base: '2px', md: '4px' }}
          w={{ base: '38px', md: '44px' }}
          h={{ base: '38px', md: '44px' }}
          minW={{ base: '38px', md: '44px' }}
          borderRadius="full"
          color="white"
          bgGradient="linear(135deg, #F6D365 0%, #D4AF37 45%, #B8860B 100%)"
          boxShadow="0 12px 24px rgba(184, 134, 11, .35)"
          border="2px solid"
          borderColor="white"
          zIndex={2}
          _hover={{ transform: 'translateY(-2px) scale(1.04)', filter: 'brightness(1.05)' }}
          _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.200', outlineOffset: '3px' }}
        />
      )}

      {cleanLinks.map((link, index) => {
        const meta = getLinkMeta(link);
        const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;
        const positions = [
          { top: { base: '2px', md: '4px' }, left: { base: '12%', md: '18%' } },
          { top: { base: '2px', md: '4px' }, right: { base: '12%', md: '18%' } },
          { bottom: { base: '2px', md: '4px' }, left: { base: '12%', md: '18%' } },
          { bottom: { base: '2px', md: '4px' }, right: { base: '12%', md: '18%' } },
        ];

        return (
          <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
            <IconButton
              as={Link}
              href={href}
              isExternal={!href.startsWith('mailto:')}
              aria-label={meta.label}
              icon={<Icon as={meta.icon} w="16px" h="16px" />}
              position="absolute"
              {...positions[index % positions.length]}
              sx={{ background: meta.bg }}
              color="white"
              borderRadius="full"
              w={{ base: '32px', md: '36px' }}
              h={{ base: '32px', md: '36px' }}
              minW={{ base: '32px', md: '36px' }}
              boxShadow="0 10px 18px rgba(15, 23, 42, .18)"
              border="2px solid"
              borderColor="white"
              opacity={isOpen ? 1 : 0}
              visibility={isOpen ? 'visible' : 'hidden'}
              transform={isOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 6px, 0) scale(.75)'}
              transition={`all .22s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 35 : 0}ms`}
              _hover={{ transform: 'translate3d(0, -2px, 0) scale(1.06)', filter: 'brightness(1.05)', textDecoration: 'none' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}
export default function SponsorStrip({ type, max, title, offset = 0, sponsors: injectedSponsors, previewSponsor }) {
  const normalizedMax = Math.max(1, Number(max || SPONSOR_CAPACITY[type] || 1));
  const normalizedOffset = Math.max(0, Number(offset || 0));
  const [sponsors, setSponsors] = useState([]);
  const [activeVideoSponsor, setActiveVideoSponsor] = useState(null);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  useEffect(() => {
    if (previewSponsor) {
      setSponsors([previewSponsor]);
      return;
    }

    if (injectedSponsors) {
      const activeSponsors = injectedSponsors.filter(Boolean).filter((sponsor) => sponsor.active !== false).slice(normalizedOffset, normalizedOffset + normalizedMax);
      setSponsors(activeSponsors);
      return;
    }

    SponsorService.getPublicByType(type, normalizedMax + normalizedOffset)
      .then((data) => {
        const visible = (data || []).filter(Boolean).filter((sponsor) => sponsor.active !== false).slice(normalizedOffset, normalizedOffset + normalizedMax);
        setSponsors(visible);
      })
      .catch(() => setSponsors([]));
  }, [type, normalizedMax, normalizedOffset, injectedSponsors, previewSponsor]);

  const visibleSponsors = sponsors.filter(Boolean).filter((sponsor) => sponsor.active !== false);
  const slotCount = Math.min(normalizedMax, Math.max(0, (SPONSOR_CAPACITY[type] || normalizedMax) - normalizedOffset));
  const sponsorsWithAvailableSlots = [
    ...visibleSponsors,
    ...Array.from({ length: Math.max(slotCount - visibleSponsors.length, 0) }, (_, index) => makeAvailableSponsor(type, normalizedOffset + visibleSponsors.length + index + 1)),
  ];
  const columns = { base: Math.min(slotCount || normalizedMax, 2), md: Math.min(slotCount || normalizedMax, 4) };

  const renderAvailableCard = (sponsor) => (
    <Box
      key={sponsor.id}
      as={RLink}
      to="/sponsors/packages"
      role="group"
      bg={cardBg}
      p={{ base: '10px', md: '12px' }}
      borderRadius={{ base: '14px', md: '18px' }}
      boxShadow="sm"
      border="1px dashed"
      borderColor="brand.300"
      minW="0"
      minH={{ base: '104px', md: '122px' }}
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
        bg: 'repeating-linear-gradient(135deg, rgba(56, 161, 105, .06) 0px, rgba(56, 161, 105, .06) 10px, rgba(255,255,255,.18) 10px, rgba(255,255,255,.18) 20px)',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: '6px',
        borderRadius: { base: '14px', md: '20px' },
        border: '1px solid',
        borderColor: 'whiteAlpha.700',
        pointerEvents: 'none',
      }}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md', borderColor: 'brand.500', textDecoration: 'none' }}
      _focusVisible={{ outline: '3px solid', outlineColor: 'brand.300', outlineOffset: '4px' }}
    >
      <Stack spacing={{ base: '4px', md: '6px' }} position="relative" zIndex={1} align="center">
        <Text fontWeight="900" fontSize={{ base: 'sm', md: 'md' }} color="brand.600">Disponible</Text>
        <Box w={{ base: '34px', md: '42px' }} h={{ base: '34px', md: '42px' }} borderRadius="full" bg="brand.50" color="brand.500" display="flex" alignItems="center" justifyContent="center" _groupHover={{ transform: 'scale(1.06)' }} transition="transform .2s ease">
          <Icon as={MdAddBusiness} w={{ base: '18px', md: '22px' }} h={{ base: '18px', md: '22px' }} />
        </Box>
        <Text color={muted} fontSize={{ base: '10px', md: 'xs' }} maxW="230px">Tocá para ver paquetes.</Text>
      </Stack>
    </Box>
  );

  const renderSponsorCard = (sponsor) => {
    if (!sponsor) return null;
    if (sponsor.isAvailable) return renderAvailableCard(sponsor);
    const linkMax = sponsor?.type === 'General' || type === 'General' ? 1 : 4;
    const isVipWithVideo = sponsor?.type === 'VIP' && sponsor.videoUrl;

    if (isVipWithVideo) {
      return (
        <Box key={sponsor.id} bg={cardBg} p={{ base: '10px', md: '12px' }} borderRadius={{ base: '14px', md: '18px' }} boxShadow="sm" border="1px solid" borderColor={borderColor} minW="0" overflow="hidden">
          <Stack spacing={{ base: '6px', md: '8px' }} align="center" textAlign="center">
            <Text fontWeight="800" fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>{sponsor.name}</Text>
            <Box display="flex" alignItems="center" justifyContent="center" gap={{ base: '8px', md: '12px' }} w="100%">
              <Box flex="1" minW="0">
                <SponsorLogoHub sponsor={sponsor} links={sponsor.links} max={linkMax} muted={muted} />
              </Box>
              <Box
                as="button"
                type="button"
                aria-label={`Ver video de ${sponsor.name}`}
                onClick={() => setActiveVideoSponsor(sponsor)}
                flexShrink={0}
                px={{ base: '10px', md: '12px' }}
                py={{ base: '7px', md: '8px' }}
                borderRadius="full"
                color="white"
                bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 42%, #8A5A00 100%)"
                boxShadow="0 12px 22px rgba(184, 134, 11, .32)"
                display="inline-flex"
                alignItems="center"
                gap="5px"
                fontSize={{ base: '11px', md: 'xs' }}
                fontWeight="900"
                whiteSpace="nowrap"
                cursor="pointer"
                _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.05)' }}
                _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.200', outlineOffset: '3px' }}
              >
                <Icon as={MdPlayCircleFilled} w={{ base: '17px', md: '19px' }} h={{ base: '17px', md: '19px' }} />
                Video
              </Box>
            </Box>
            {sponsor.description && <Text color={muted} fontSize={{ base: '10px', md: 'xs' }} noOfLines={1}>{sponsor.description}</Text>}
          </Stack>
        </Box>
      );
    }

    const videoColumns = { base: 1 };

    return (
      <Box key={sponsor.id} bg={cardBg} p={{ base: '10px', md: '12px' }} borderRadius={{ base: '14px', md: '18px' }} boxShadow="sm" border="1px solid" borderColor={borderColor} minW="0" overflow="hidden">
        <SimpleGrid columns={videoColumns} spacing={{ base: '8px', md: '12px' }} alignItems="center">
          <Stack spacing={{ base: '4px', md: '6px' }} h="100%" align="center" textAlign="center">
            <Text fontWeight="800" fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>{sponsor.name}</Text>
            <SponsorLogoHub sponsor={sponsor} links={sponsor.links} max={linkMax} muted={muted} />
            {sponsor.description && <Text color={muted} fontSize={{ base: '10px', md: 'xs' }} noOfLines={1}>{sponsor.description}</Text>}
          </Stack>
          {sponsor.type === 'VIP' && sponsor.videoUrl && (
            <Box
              as="button"
              type="button"
              aria-label={`Ver video de ${sponsor.name}`}
              onClick={() => setActiveVideoSponsor(sponsor)}
              mx="auto"
              mt="2px"
              px={{ base: '12px', md: '14px' }}
              py={{ base: '7px', md: '8px' }}
              borderRadius="full"
              color="white"
              bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 42%, #8A5A00 100%)"
              boxShadow="0 14px 28px rgba(184, 134, 11, .35)"
              display="inline-flex"
              alignItems="center"
              gap="6px"
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="900"
              letterSpacing=".01em"
              cursor="pointer"
              _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.05)' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.200', outlineOffset: '3px' }}
            >
              <Icon as={MdPlayCircleFilled} w={{ base: '18px', md: '20px' }} h={{ base: '18px', md: '20px' }} />
              Ver video
            </Box>
          )}
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <>
      <Box w="100%" opacity={0.82}>
        {title && <Text fontSize={{ base: 'xs', md: 'sm' }} color={muted} fontWeight="700" mb={{ base: '8px', md: '10px' }}>{title}</Text>}
        {previewSponsor ? renderSponsorCard(visibleSponsors[0] || previewSponsor) : (
          <SimpleGrid columns={columns} spacing={{ base: '8px', md: '10px' }}>
            {sponsorsWithAvailableSlots.map(renderSponsorCard)}
          </SimpleGrid>
        )}
      </Box>
      <Modal isOpen={Boolean(activeVideoSponsor)} onClose={() => setActiveVideoSponsor(null)} size="full" isCentered>
        <ModalOverlay />
        <ModalContent m={0} maxW="100vw" h="100vh" borderRadius={0} bg="black">
          <ModalCloseButton color="white" zIndex={2} />
          <ModalBody p={{ base: '44px 12px 12px', md: '56px 40px 40px' }} display="flex" alignItems="center" justifyContent="center">
            {activeVideoSponsor?.videoUrl && (
              <AspectRatio ratio={16 / 9} w="100%" maxH={{ base: 'calc(100vh - 72px)', md: '70vh' }}>
                {shouldRenderIframeVideo(activeVideoSponsor.videoUrl) ? (
                  <Box
                    as="iframe"
                    src={getVideoEmbedSrc(activeVideoSponsor.videoUrl)}
                    title={`Video de ${activeVideoSponsor.name}`}
                    border="0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <Box as="video" src={activeVideoSponsor.videoUrl} controls autoPlay playsInline />
                )}
              </AspectRatio>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
