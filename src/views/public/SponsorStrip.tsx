// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  AspectRatio,
  Box,
  Button,
  Icon,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdAddBusiness, MdEmail, MdFlip, MdLink, MdPlayCircleFilled, MdStar } from 'react-icons/md';
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

function SponsorActionRow({ links = [], max = 4, muted, size = 'sm' }) {
  const cleanLinks = links.filter(Boolean).slice(0, max);
  if (!cleanLinks.length) return null;

  return (
    <Stack direction="row" spacing="8px" justify="center" flexWrap="wrap" w="100%">
      {cleanLinks.map((link, index) => {
        const meta = getLinkMeta(link);
        const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;

        return (
          <Button
            key={`${link}-${index}`}
            as={Link}
            href={href}
            isExternal={!href.startsWith('mailto:')}
            size={size}
            leftIcon={<Icon as={meta.icon} />}
            borderRadius="full"
            variant="outline"
            color={muted}
            borderColor="blackAlpha.200"
            maxW="100%"
            _hover={{ textDecoration: 'none', transform: 'translateY(-1px)', borderColor: 'brand.300' }}
          >
            <Text as="span" noOfLines={1}>{meta.label === 'Instagram' ? 'Historia' : meta.label}</Text>
          </Button>
        );
      })}
    </Stack>
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

function SponsorFlipCard({ sponsor, visual, linkMax, muted }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const hasVideo = Boolean(sponsor.videoUrl);
  const { _hover, minH, ...flipCard } = visual.card;

  return (
    <Box key={sponsor.id} minW="0" sx={{ perspective: '1200px' }}>
      <Box
        position="relative"
        minH={{ base: '318px', md: '334px' }}
        sx={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform .62s cubic-bezier(.2,.8,.2,1)',
          willChange: 'transform',
        }}
      >
        <Box
          {...flipCard}
          border="1px solid"
          minW="0"
          minH="100%"
          h="100%"
          position="absolute"
          inset="0"
          overflow="hidden"
          transition="box-shadow .22s ease, border-color .22s ease"
          sx={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
        >
          <Stack h="100%" spacing={{ base: '12px', md: '14px' }} align="center" justify="space-between" textAlign="center" minW={0}>
            <Stack spacing={{ base: '8px', md: '10px' }} align="center" w="100%" minW={0}>
              <Box w="100%" minH={{ base: '104px', md: '124px' }} display="flex" alignItems="center" justifyContent="center" px={{ base: '8px', md: '12px' }}>
                {sponsor.logoUrl ? (
                  <Image src={sponsor.logoUrl} alt={sponsor.name || 'Patrocinador'} maxH={{ base: '104px', md: '124px' }} maxW="100%" objectFit="contain" />
                ) : (
                  <Box h={{ base: '88px', md: '104px' }} w="100%" borderRadius="18px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
                )}
              </Box>
              {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2} maxW="100%">{sponsor.name}</Text>}
              {sponsor.description && <Text color={muted} fontSize={{ base: '12px', md: 'sm' }} noOfLines={visual.descriptionLines} maxW="100%">{sponsor.description}</Text>}
            </Stack>

            <Stack spacing="8px" w="100%" align="center">
              {hasVideo && (
                <Button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  leftIcon={<MdPlayCircleFilled />}
                  rightIcon={<MdFlip />}
                  size={{ base: 'sm', md: 'md' }}
                  borderRadius="full"
                  bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 42%, #8A5A00 100%)"
                  color="white"
                  boxShadow="0 12px 22px rgba(184, 134, 11, .28)"
                  maxW="100%"
                  whiteSpace="normal"
                  _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.05)' }}
                >
                  Tocar para ver
                </Button>
              )}
              <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} />
            </Stack>
          </Stack>
        </Box>

        <Box
          {...flipCard}
          border="1px solid"
          minW="0"
          minH="100%"
          h="100%"
          position="absolute"
          inset="0"
          overflow="hidden"
          transition="box-shadow .22s ease, border-color .22s ease"
          sx={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <Stack h="100%" spacing="12px" justify="space-between" minW={0}>
            <Stack spacing="10px" minW={0}>
              <SponsorVideoFrame sponsor={sponsor} />
              {sponsor.name && <Text fontWeight="900" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>{sponsor.name}</Text>}
              {sponsor.description && <Text color={muted} fontSize="xs" noOfLines={2}>{sponsor.description}</Text>}
            </Stack>
            <Stack spacing="8px" w="100%">
              <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} size="xs" />
              <Button type="button" onClick={() => setIsFlipped(false)} variant="outline" borderRadius="full" leftIcon={<MdFlip />}>
                Volver al frente
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
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
    const isVipWithVideo = sponsorType === 'VIP' && sponsor.videoUrl;
    const visual = sponsorVisual(sponsorType, Boolean(sponsor.videoUrl));

    if (isVipWithVideo) {
      return <SponsorFlipCard key={sponsor.id} sponsor={sponsor} visual={visual} linkMax={linkMax} muted={muted} />;
    }

    const videoColumns = { base: 1 };

    return (
      <Box key={sponsor.id} {...visual.card} border="1px solid" minW="0" overflow="hidden" position="relative" transition="transform .22s ease, box-shadow .22s ease, border-color .22s ease">
        <SimpleGrid columns={videoColumns} spacing={{ base: '8px', md: '12px' }} alignItems="center" h="100%">
          <Stack direction={{ base: 'row', md: 'column' }} spacing={{ base: '12px', md: '6px' }} h="100%" align="center">
            <Box flex={{ base: '0 0 38%', md: 'initial' }} minW="0" w={{ base: '38%', md: '100%' }} display="flex" alignItems="center" justifyContent="center">
              {sponsor.logoUrl ? (
                <Image src={sponsor.logoUrl} alt={sponsor.name || 'Patrocinador'} h={logoSize(visual.logo).h} maxW="100%" objectFit="contain" />
              ) : (
                <Box h={logoSize(visual.logo).placeholderH} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
              )}
            </Box>
            <Stack spacing={{ base: '4px', md: '6px' }} align={{ base: 'flex-start', md: 'center' }} textAlign={{ base: 'left', md: 'center' }} flex="1" minW="0" overflow="hidden">
              {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2} maxW="100%">{sponsor.name}</Text>}
              {sponsor.description && <Text color={muted} fontSize={{ base: '11px', md: 'xs' }} noOfLines={visual.descriptionLines} maxW="100%">{sponsor.description}</Text>}
              <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} size="xs" />
            </Stack>
          </Stack>
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

    </>
  );
}
