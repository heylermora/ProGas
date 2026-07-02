// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  AspectRatio,
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
import { MdAddBusiness, MdEmail, MdLink, MdPlayCircleFilled, MdStar } from 'react-icons/md';
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
        p: { base: '16px', md: hasVideo ? '18px' : '20px' },
        minH: { base: hasVideo ? '220px' : '210px', md: hasVideo ? '250px' : '230px' },
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
  if (variant === 'hero') return { h: { base: '104px', md: '132px' }, placeholderH: { base: '108px', md: '136px' }, icon: { base: '38px', md: '42px' } };
  if (variant === 'featured') return { h: { base: '54px', md: '70px' }, placeholderH: { base: '54px', md: '70px' }, icon: { base: '34px', md: '38px' } };
  return { h: { base: '48px', md: '58px' }, placeholderH: { base: '48px', md: '58px' }, icon: { base: '32px', md: '34px' } };
};

const bubblePlacements = [
  { base: { top: '-8px', left: '18px' }, md: { top: '6px', left: '-10px' } },
  { base: { top: '-10px', right: '20px' }, md: { top: '-6px', right: '10px' } },
  { base: { bottom: '-8px', left: '22px' }, md: { bottom: '6px', left: '-12px' } },
  { base: { bottom: '-10px', right: '22px' }, md: { bottom: '0', right: '4px' } },
];

const normalizeHref = (link = '') => (link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link);

function SponsorLogoHub({ sponsor, visual, muted, links = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const cleanLinks = links.filter(Boolean);
  const hasLinks = cleanLinks.length > 0;
  const size = logoSize(visual.logo);

  return (
    <Box position="relative" w="100%" maxW={{ base: visual.logo === 'hero' ? '260px' : '210px', md: visual.logo === 'hero' ? '320px' : '220px' }} mx="auto" py={{ base: '8px', md: '10px' }} overflow="visible">
      <Box
        as="button"
        type="button"
        aria-label={hasLinks ? (isOpen ? `Ocultar links de ${sponsor.name || 'patrocinador'}` : `Mostrar links de ${sponsor.name || 'patrocinador'}`) : `Logo de ${sponsor.name || 'patrocinador'}`}
        aria-expanded={hasLinks ? isOpen : undefined}
        onClick={() => hasLinks && setIsOpen((current) => !current)}
        position="relative"
        zIndex={2}
        w="100%"
        minH={size.placeholderH}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius={{ base: '18px', md: '22px' }}
        cursor={hasLinks ? 'pointer' : 'default'}
        transition="transform .2s ease, filter .2s ease, box-shadow .2s ease"
        _hover={hasLinks ? { transform: 'translateY(-2px) scale(1.01)', boxShadow: 'inset 0 0 0 1px rgba(56, 161, 105, .22)' } : undefined}
        _focusVisible={hasLinks ? { outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '4px' } : undefined}
      >
        {sponsor.logoUrl ? (
          <Image src={sponsor.logoUrl} alt={sponsor.name || 'Patrocinador'} h={size.h} maxW="100%" objectFit="contain" pointerEvents="none" />
        ) : (
          <Box h={size.placeholderH} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
        )}
      </Box>


      {cleanLinks.slice(0, 4).map((link, index) => {
        const meta = getLinkMeta(link);
        const href = normalizeHref(link);
        const placement = bubblePlacements[index] || bubblePlacements[0];

        return (
          <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
            <IconButton
              as={Link}
              href={href}
              isExternal={!href.startsWith('mailto:')}
              aria-label={`Abrir ${meta.label}`}
              icon={<Icon as={meta.icon} w={{ base: '18px', md: '20px' }} h={{ base: '18px', md: '20px' }} />}
              position="absolute"
              zIndex={1}
              {...placement.base}
              sx={{
                '@media screen and (min-width: 48em)': placement.md,
                background: meta.bg,
              }}
              color="white"
              w={{ base: '42px', md: '48px' }}
              h={{ base: '42px', md: '48px' }}
              minW={{ base: '42px', md: '48px' }}
              borderRadius="full"
              border="2px solid"
              borderColor="white"
              boxShadow="0 14px 24px rgba(15, 23, 42, .24)"
              opacity={isOpen ? 1 : 0}
              visibility={isOpen ? 'visible' : 'hidden'}
              transform={isOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 12px, 0) scale(.6)'}
              transition={`all .26s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 45 : 0}ms`}
              _hover={{ textDecoration: 'none', transform: 'translate3d(0, -4px, 0) scale(1.08)', filter: 'brightness(1.06)' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

function SponsorVideoFrame({ sponsor }) {
  if (!sponsor?.videoUrl) return null;

  return (
    <AspectRatio ratio={16 / 9} w="100%" borderRadius="18px" overflow="hidden" bg="black" flexShrink={0}>
      {shouldRenderIframeVideo(sponsor.videoUrl) ? (
        <Box
          as="iframe"
          src={getVideoEmbedSrc(sponsor.videoUrl)}
          title={`Video de ${sponsor.name || 'patrocinador'}`}
          border="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <Box as="video" src={sponsor.videoUrl} controls playsInline />
      )}
    </AspectRatio>
  );
}

function SponsorCard({ sponsor, visual, linkMax, muted }) {
  const [showVideo, setShowVideo] = useState(false);
  const hasVideo = Boolean(sponsor.videoUrl);
  const { _hover, minH, ...cardStyles } = visual.card;

  if (showVideo) {
    return (
      <Box key={sponsor.id} {...cardStyles} border="1px solid" minW="0" overflow="hidden" transition="box-shadow .22s ease, border-color .22s ease">
        <Stack spacing={{ base: '10px', md: '12px' }} minW={0}>
          <SponsorVideoFrame sponsor={sponsor} />
          <Stack spacing="8px" align="center" textAlign="center" minW={0}>
            {sponsor.name && <Text fontWeight="900" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>{sponsor.name}</Text>}
            {sponsor.description && <Text color={muted} fontSize="xs" noOfLines={2} maxW="100%">{sponsor.description}</Text>}
            <IconButton
              type="button"
              onClick={() => setShowVideo(false)}
              aria-label="Volver al logo y links del patrocinador"
              icon={<Icon as={MdLink} w={{ base: '20px', md: '22px' }} h={{ base: '20px', md: '22px' }} />}
              w={{ base: '44px', md: '48px' }}
              h={{ base: '44px', md: '48px' }}
              minW={{ base: '44px', md: '48px' }}
              borderRadius="full"
              bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 45%, #8A5A00 100%)"
              color="white"
              boxShadow="0 14px 26px rgba(184, 134, 11, .34)"
              border="2px solid"
              borderColor="white"
              _hover={{ transform: 'translateY(-2px) scale(1.06)', filter: 'brightness(1.05)' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' }}
            />
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box key={sponsor.id} {...cardStyles} border="1px solid" minW="0" overflow="visible" position="relative" transition="transform .22s ease, box-shadow .22s ease, border-color .22s ease">
      <Stack spacing={{ base: '8px', md: '10px' }} h="100%" align="center" justify="space-between" textAlign="center" minW={0}>
        <SponsorLogoHub sponsor={sponsor} visual={visual} muted={muted} links={(sponsor.links || []).slice(0, linkMax)} />
        {hasVideo && (
          <IconButton
            type="button"
            onClick={() => setShowVideo(true)}
            aria-label={`Ver video de ${sponsor.name || 'patrocinador'}`}
            icon={<Icon as={MdPlayCircleFilled} w={{ base: '20px', md: '24px' }} h={{ base: '20px', md: '24px' }} />}
            mt={{ base: '-4px', md: '-2px' }}
            w={{ base: '44px', md: '50px' }}
            h={{ base: '44px', md: '50px' }}
            minW={{ base: '44px', md: '50px' }}
            borderRadius="full"
            bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 45%, #8A5A00 100%)"
            color="white"
            boxShadow="0 14px 26px rgba(184, 134, 11, .34)"
            border="2px solid"
            borderColor="white"
            _hover={{ transform: 'translateY(-2px) scale(1.06)', filter: 'brightness(1.05)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' }}
          />
        )}
        <Stack spacing={{ base: '4px', md: '6px' }} align="center" minW={0} w="100%">
          {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2} maxW="100%">{sponsor.name}</Text>}
          {sponsor.description && <Text color={muted} fontSize={{ base: '11px', md: 'xs' }} noOfLines={visual.descriptionLines} maxW="100%">{sponsor.description}</Text>}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function SponsorStrip({ type, max, title, offset = 0, sponsors: injectedSponsors, previewSponsor }) {
  const normalizedMax = Math.max(1, Number(max || SPONSOR_CAPACITY[type] || 1));
  const normalizedOffset = Math.max(0, Number(offset || 0));
  const [sponsors, setSponsors] = useState([]);
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
    const visual = sponsorVisual(sponsorType, Boolean(sponsor.videoUrl));

    return <SponsorCard key={sponsor.id} sponsor={sponsor} visual={visual} linkMax={linkMax} muted={muted} />;
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

    </>
  );
}
