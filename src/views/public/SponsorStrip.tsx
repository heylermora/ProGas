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
import { MdAddBusiness, MdClose, MdEmail, MdLink, MdPlayCircleFilled, MdShare, MdStar } from 'react-icons/md';
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

const sponsorVisual = (type = 'General', hasVideo = false) => {
  if (type === 'VIP') {
    return {
      card: {
        bgGradient: 'linear(145deg, rgba(255, 250, 235, .98), rgba(255, 255, 255, .95))',
        borderColor: 'yellow.200',
        boxShadow: '0 18px 45px rgba(180, 130, 24, .16)',
        borderRadius: { base: '20px', md: '26px' },
        p: { base: '14px', md: hasVideo ? '16px' : '18px' },
        minH: { base: hasVideo ? '150px' : '158px', md: hasVideo ? '158px' : '178px' },
        _hover: { transform: 'translateY(-5px) scale(1.01)', boxShadow: '0 22px 56px rgba(180, 130, 24, .22)', borderColor: 'yellow.300' },
      },
      logo: 'hero',
      nameSize: { base: 'md', md: 'lg' },
      descriptionLines: 2,
      actionLabel: 'Ver historia',
    };
  }

  if (type === 'Premium') {
    return {
      card: {
        bgGradient: 'linear(145deg, rgba(255, 255, 255, .98), rgba(245, 247, 255, .96))',
        borderColor: 'purple.100',
        boxShadow: '0 12px 30px rgba(71, 85, 105, .12)',
        borderRadius: { base: '18px', md: '22px' },
        p: { base: '12px', md: '14px' },
        minH: { base: '132px', md: '142px' },
        _hover: { transform: 'translateY(-4px)', boxShadow: '0 18px 40px rgba(71, 85, 105, .17)', borderColor: 'purple.200' },
      },
      logo: 'featured',
      nameSize: { base: 'sm', md: 'md' },
      descriptionLines: 1,
      actionLabel: 'Conectar',
    };
  }

  return {
    card: {
      bg: 'white',
      borderColor: 'gray.100',
      boxShadow: '0 8px 22px rgba(15, 23, 42, .08)',
      borderRadius: { base: '16px', md: '18px' },
      p: { base: '12px', md: '12px' },
      minH: { base: '118px', md: '122px' },
      _hover: { transform: 'translateY(-3px)', boxShadow: '0 14px 30px rgba(15, 23, 42, .12)', borderColor: 'brand.100' },
    },
    logo: 'compact',
    nameSize: { base: 'sm', md: 'md' },
    descriptionLines: 1,
    actionLabel: 'Abrir',
  };
};

const logoSize = (variant) => {
  if (variant === 'hero') return { h: { base: '64px', md: '86px' }, placeholderH: { base: '64px', md: '86px' }, icon: { base: '38px', md: '42px' } };
  if (variant === 'featured') return { h: { base: '54px', md: '70px' }, placeholderH: { base: '54px', md: '70px' }, icon: { base: '34px', md: '38px' } };
  return { h: { base: '48px', md: '58px' }, placeholderH: { base: '48px', md: '58px' }, icon: { base: '32px', md: '34px' } };
};

function SponsorLogoHub({ sponsor, links = [], max = 4, muted, variant = 'compact', actionLabel = 'Conectar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const cleanLinks = links.filter(Boolean).slice(0, max);
  const hasLinks = cleanLinks.length > 0;
  const sizes = logoSize(variant);
  const isHero = variant === 'hero';

  return (
    <Box position="relative" w="100%" display="flex" justifyContent="center" py={hasLinks ? { base: '8px', md: '10px' } : '0px'}>
      <Box
        as={hasLinks ? 'button' : 'div'}
        type={hasLinks ? 'button' : undefined}
        aria-label={hasLinks ? (isOpen ? `Ocultar acciones de ${sponsor.name}` : `Ver acciones de ${sponsor.name}`) : undefined}
        aria-expanded={hasLinks ? isOpen : undefined}
        onClick={hasLinks ? () => setIsOpen((current) => !current) : undefined}
        position="relative"
        borderRadius={isHero ? '24px' : '20px'}
        p={{ base: '5px', md: isHero ? '8px' : '6px' }}
        cursor={hasLinks ? 'pointer' : 'default'}
        transition="transform .22s ease, filter .22s ease"
        _hover={hasLinks ? { transform: 'translateY(-2px)', filter: 'drop-shadow(0 12px 20px rgba(15, 23, 42, .12))' } : undefined}
        _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '4px' }}
      >
        {sponsor.logoUrl ? (
          <Image src={sponsor.logoUrl} alt={sponsor.name} h={sizes.h} maxW="100%" objectFit="contain" pointerEvents="none" />
        ) : (
          <Box h={sizes.placeholderH} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
        )}
      </Box>

      {hasLinks && (
        <IconButton
          type="button"
          aria-label={isOpen ? `Ocultar acciones de ${sponsor.name}` : `Ver acciones de ${sponsor.name}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          icon={<Icon as={isOpen ? MdClose : MdShare} w={{ base: '16px', md: '18px' }} h={{ base: '16px', md: '18px' }} />}
          position="absolute"
          right={{ base: isHero ? '6px' : '8px', md: isHero ? '18px' : '14px' }}
          bottom={{ base: isHero ? '0px' : '2px', md: isHero ? '6px' : '4px' }}
          w={sizes.icon}
          h={sizes.icon}
          minW={sizes.icon}
          borderRadius="full"
          color="white"
          bgGradient={isHero ? 'linear(135deg, #FFE29F 0%, #D4AF37 48%, #8A5A00 100%)' : 'linear(135deg, #F6D365 0%, #D4AF37 45%, #B8860B 100%)'}
          boxShadow={isHero ? '0 16px 30px rgba(184, 134, 11, .38)' : '0 12px 24px rgba(184, 134, 11, .28)'}
          border="2px solid"
          borderColor="white"
          zIndex={2}
          _hover={{ transform: 'translateY(-2px) scale(1.04)', filter: 'brightness(1.05)' }}
          _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.200', outlineOffset: '3px' }}
        />
      )}

      {hasLinks && isOpen && (
        <Text position="absolute" top={{ base: '-4px', md: '-2px' }} left="50%" transform="translateX(-50%)" color={muted} fontSize={{ base: '9px', md: '10px' }} fontWeight="800" letterSpacing=".08em" textTransform="uppercase" whiteSpace="nowrap">
          {actionLabel}
        </Text>
      )}

      {cleanLinks.map((link, index) => {
        const meta = getLinkMeta(link);
        const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;
        const distance = isHero ? { base: '6%', md: '12%' } : { base: '12%', md: '18%' };
        const positions = [
          { top: { base: '2px', md: '4px' }, left: distance },
          { top: { base: '2px', md: '4px' }, right: distance },
          { bottom: { base: '2px', md: '4px' }, left: distance },
          { bottom: { base: '2px', md: '4px' }, right: distance },
        ];

        return (
          <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
            <IconButton
              as={Link}
              href={href}
              isExternal={!href.startsWith('mailto:')}
              aria-label={meta.label}
              icon={<Icon as={meta.icon} w={isHero ? '18px' : '16px'} h={isHero ? '18px' : '16px'} />}
              position="absolute"
              {...positions[index % positions.length]}
              sx={{ background: meta.bg }}
              color="white"
              borderRadius="full"
              w={isHero ? { base: '36px', md: '42px' } : { base: '32px', md: '36px' }}
              h={isHero ? { base: '36px', md: '42px' } : { base: '32px', md: '36px' }}
              minW={isHero ? { base: '36px', md: '42px' } : { base: '32px', md: '36px' }}
              boxShadow="0 12px 22px rgba(15, 23, 42, .20)"
              border="2px solid"
              borderColor="white"
              opacity={isOpen ? 1 : 0}
              visibility={isOpen ? 'visible' : 'hidden'}
              transform={isOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 8px, 0) scale(.72)'}
              transition={`all .24s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 42 : 0}ms`}
              _hover={{ transform: 'translate3d(0, -3px, 0) scale(1.08)', filter: 'brightness(1.05)', textDecoration: 'none' }}
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
  const columns = { base: 1, sm: 2, md: Math.min(slotCount || normalizedMax, 4) };

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
      minH={{ base: '118px', md: '122px' }}
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
      <Stack direction={{ base: 'row', md: 'column' }} spacing={{ base: '12px', md: '6px' }} position="relative" zIndex={1} align="center" justify="center" textAlign={{ base: 'left', md: 'center' }}>
        <Box flexShrink={0} w={{ base: '42px', md: '42px' }} h={{ base: '42px', md: '42px' }} borderRadius="full" bg="brand.50" color="brand.500" display="flex" alignItems="center" justifyContent="center" _groupHover={{ transform: 'scale(1.06)' }} transition="transform .2s ease">
          <Icon as={MdAddBusiness} w={{ base: '22px', md: '22px' }} h={{ base: '22px', md: '22px' }} />
        </Box>
        <Stack spacing="3px" minW="0">
          <Text fontWeight="900" fontSize={{ base: 'md', md: 'md' }} color="brand.600">Tu marca aquí</Text>
          <Text color={muted} fontSize={{ base: 'xs', md: 'xs' }} maxW="230px" lineHeight="1.35">Llegá a clientes locales mientras hacen su pedido.</Text>
        </Stack>
      </Stack>
    </Box>
  );

  const renderSponsorCard = (sponsor) => {
    if (!sponsor) return null;
    if (sponsor.isAvailable) return renderAvailableCard(sponsor);
    const sponsorType = sponsor?.type || type;
    const linkMax = sponsorType === 'General' ? 1 : 4;
    const isVipWithVideo = sponsorType === 'VIP' && sponsor.videoUrl;
    const visual = sponsorVisual(sponsorType, Boolean(sponsor.videoUrl));

    if (isVipWithVideo) {
      return (
        <Box key={sponsor.id} {...visual.card} border="1px solid" minW="0" overflow="hidden" position="relative" transition="transform .22s ease, box-shadow .22s ease, border-color .22s ease">
          <Stack direction={{ base: 'row', md: 'column' }} spacing={{ base: '12px', md: '8px' }} align="center" h="100%">
            <Box flex={{ base: '0 0 42%', md: 'initial' }} minW="0" w={{ base: '42%', md: '100%' }}>
              <SponsorLogoHub sponsor={sponsor} links={sponsor.links} max={linkMax} muted={muted} variant={visual.logo} actionLabel={visual.actionLabel} />
            </Box>
            <Stack spacing={{ base: '6px', md: '8px' }} align={{ base: 'flex-start', md: 'center' }} textAlign={{ base: 'left', md: 'center' }} flex="1" minW="0">
              {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2}>{sponsor.name}</Text>}
              {sponsor.description && <Text color={muted} fontSize={{ base: '11px', md: 'xs' }} noOfLines={visual.descriptionLines}>{sponsor.description}</Text>}
              <Box
                as="button"
                type="button"
                aria-label={`Ver video de ${sponsor.name}`}
                onClick={() => setActiveVideoSponsor(sponsor)}
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
                Ver video
              </Box>
            </Stack>
          </Stack>
        </Box>
      );
    }

    const videoColumns = { base: 1 };

    return (
      <Box key={sponsor.id} {...visual.card} border="1px solid" minW="0" overflow="hidden" position="relative" transition="transform .22s ease, box-shadow .22s ease, border-color .22s ease">
        <SimpleGrid columns={videoColumns} spacing={{ base: '8px', md: '12px' }} alignItems="center" h="100%">
          <Stack direction={{ base: 'row', md: 'column' }} spacing={{ base: '12px', md: '6px' }} h="100%" align="center">
            <Box flex={{ base: '0 0 38%', md: 'initial' }} minW="0" w={{ base: '38%', md: '100%' }}>
              <SponsorLogoHub sponsor={sponsor} links={sponsor.links} max={linkMax} muted={muted} variant={visual.logo} actionLabel={visual.actionLabel} />
            </Box>
            <Stack spacing={{ base: '4px', md: '6px' }} align={{ base: 'flex-start', md: 'center' }} textAlign={{ base: 'left', md: 'center' }} flex="1" minW="0">
              {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2}>{sponsor.name}</Text>}
              {sponsor.description && <Text color={muted} fontSize={{ base: '11px', md: 'xs' }} noOfLines={visual.descriptionLines}>{sponsor.description}</Text>}
            </Stack>
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
      <Box w="100%">
        {title && (
          <Box display="flex" alignItems="center" gap="8px" mb={{ base: '10px', md: '10px' }}>
            <Box w="28px" h="28px" borderRadius="full" bg="yellow.100" color="yellow.700" display="flex" alignItems="center" justifyContent="center">
              <Icon as={MdStar} w="15px" h="15px" />
            </Box>
            <Text fontSize={{ base: 'sm', md: 'sm' }} color={muted} fontWeight="900" letterSpacing=".04em" textTransform="uppercase">{title}</Text>
          </Box>
        )}
        {previewSponsor ? renderSponsorCard(visibleSponsors[0] || previewSponsor) : (
          <SimpleGrid columns={columns} spacing={{ base: '12px', md: '10px' }}>
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
