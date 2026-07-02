// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  AspectRatio,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  ScaleFade,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
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

function SponsorActionRow({ links = [], max = 4, muted, size = 'sm', isExpanded: controlledExpanded, onToggle }) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const cleanLinks = links.filter(Boolean).slice(0, max);
  if (!cleanLinks.length) return null;

  const primaryMeta = getLinkMeta(cleanLinks[0]);
  const primaryHref = cleanLinks[0].includes('@') && !cleanLinks[0].startsWith('mailto:') ? `mailto:${cleanLinks[0]}` : cleanLinks[0];
  const bubbleSize = size === 'xs' ? { base: '34px', md: '36px' } : { base: '40px', md: '44px' };
  const iconSize = size === 'xs' ? { base: '16px', md: '17px' } : { base: '18px', md: '20px' };
  const extraLinks = cleanLinks.slice(1);
  const isExpanded = controlledExpanded ?? localExpanded;
  const toggleExpanded = onToggle || (() => setLocalExpanded((current) => !current));

  return (
    <Stack spacing="8px" align="center" w="100%" minW={0}>
      <HStack spacing="7px" justify="center" flexWrap="wrap" maxW="100%">
        <Tooltip label={primaryMeta.label} hasArrow placement="top">
          <IconButton
            as={Link}
            href={primaryHref}
            isExternal={!primaryHref.startsWith('mailto:')}
            aria-label={`Abrir ${primaryMeta.label}`}
            icon={<Icon as={primaryMeta.icon} w={iconSize} h={iconSize} />}
            w={bubbleSize}
            h={bubbleSize}
            minW={bubbleSize}
            borderRadius="full"
            color="white"
            sx={{ background: primaryMeta.bg }}
            boxShadow="0 12px 24px rgba(15, 23, 42, .20)"
            border="2px solid"
            borderColor="whiteAlpha.900"
            _hover={{ textDecoration: 'none', transform: 'translateY(-3px) scale(1.07)', filter: 'brightness(1.06)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
          />
        </Tooltip>

        {extraLinks.length > 0 && (
          <Button
            type="button"
            onClick={toggleExpanded}
            size={size}
            h={bubbleSize}
            minW={bubbleSize}
            px={isExpanded ? '12px' : '0'}
            borderRadius="full"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Ocultar links del partner' : 'Mostrar links del partner'}
            color={isExpanded ? 'white' : muted}
            bg={isExpanded ? 'brand.500' : 'white'}
            border="1px solid"
            borderColor={isExpanded ? 'brand.500' : 'blackAlpha.200'}
            boxShadow="0 10px 22px rgba(15, 23, 42, .12)"
            _hover={{ transform: 'translateY(-2px)', bg: isExpanded ? 'brand.600' : 'gray.50' }}
          >
            {isExpanded ? 'Cerrar' : `+${extraLinks.length}`}
          </Button>
        )}
      </HStack>

      {extraLinks.length > 0 && (
        <ScaleFade initialScale={0.88} in={isExpanded} unmountOnExit>
          <HStack
            spacing="7px"
            justify="center"
            flexWrap="wrap"
            bg="whiteAlpha.900"
            border="1px solid"
            borderColor="blackAlpha.100"
            borderRadius="full"
            px="8px"
            py="6px"
            boxShadow="0 14px 28px rgba(15, 23, 42, .14)"
            maxW="100%"
          >
            {extraLinks.map((link, index) => {
              const meta = getLinkMeta(link);
              const href = link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;

              return (
                <Tooltip key={`${link}-${index}`} label={meta.label} hasArrow placement="top">
                  <IconButton
                    as={Link}
                    href={href}
                    isExternal={!href.startsWith('mailto:')}
                    aria-label={`Abrir ${meta.label}`}
                    icon={<Icon as={meta.icon} w={iconSize} h={iconSize} />}
                    w={bubbleSize}
                    h={bubbleSize}
                    minW={bubbleSize}
                    borderRadius="full"
                    color="white"
                    sx={{ background: meta.bg }}
                    boxShadow="0 10px 20px rgba(15, 23, 42, .18)"
                    border="2px solid"
                    borderColor="white"
                    _hover={{ textDecoration: 'none', transform: 'translateY(-3px) scale(1.08)', filter: 'brightness(1.06)' }}
                    _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
                  />
                </Tooltip>
              );
            })}
          </HStack>
        </ScaleFade>
      )}
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

  const frontLogo = (
    <Box
      as="button"
      type="button"
      aria-label={hasVideo ? `Ver video de ${sponsor.name || 'patrocinador'}` : `Ver links de ${sponsor.name || 'patrocinador'}`}
      onClick={() => hasVideo && setIsFlipped(true)}
      w="100%"
      minH={{ base: '112px', md: '132px' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: '8px', md: '12px' }}
      borderRadius="20px"
      cursor={hasVideo ? 'pointer' : 'default'}
      position="relative"
      transition="transform .2s ease, box-shadow .2s ease"
      _hover={hasVideo ? { transform: 'translateY(-2px)', boxShadow: 'inset 0 0 0 1px rgba(212, 175, 55, .32)' } : undefined}
      _focusVisible={hasVideo ? { outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' } : undefined}
    >
      {sponsor.logoUrl ? (
        <Image src={sponsor.logoUrl} alt={sponsor.name || 'Patrocinador'} maxH={{ base: '112px', md: '132px' }} maxW="100%" objectFit="contain" pointerEvents="none" />
      ) : (
        <Box h={{ base: '88px', md: '104px' }} w="100%" borderRadius="18px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
      )}
      {hasVideo && (
        <Box
          position="absolute"
          right={{ base: '8px', md: '14px' }}
          bottom={{ base: '8px', md: '12px' }}
          w={{ base: '34px', md: '40px' }}
          h={{ base: '34px', md: '40px' }}
          borderRadius="full"
          bg="yellow.400"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 10px 22px rgba(180, 130, 24, .32)"
        >
          <Icon as={MdPlayCircleFilled} w={{ base: '22px', md: '25px' }} h={{ base: '22px', md: '25px' }} />
        </Box>
      )}
    </Box>
  );

  if (isFlipped) {
    return (
      <Box key={sponsor.id} minW="0">
        <Box {...flipCard} border="1px solid" minW="0" overflow="hidden" transition="box-shadow .22s ease, border-color .22s ease">
          <Stack spacing={{ base: '10px', md: '12px' }} minW={0}>
            <SponsorVideoFrame sponsor={sponsor} />
            <Stack direction={{ base: 'column', sm: 'row' }} spacing="10px" align={{ base: 'stretch', sm: 'center' }} justify="space-between" minW={0}>
              <Stack spacing="3px" minW={0} flex="1">
                {sponsor.name && <Text fontWeight="900" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>{sponsor.name}</Text>}
                {sponsor.description && <Text color={muted} fontSize="xs" noOfLines={2}>{sponsor.description}</Text>}
              </Stack>
              <Button type="button" onClick={() => setIsFlipped(false)} variant="outline" borderRadius="full" leftIcon={<MdFlip />} size="sm" flexShrink={0}>
                Frente
              </Button>
            </Stack>
            <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} size="xs" />
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box key={sponsor.id} minW="0">
      <Box {...flipCard} border="1px solid" minW="0" overflow="hidden" transition="box-shadow .22s ease, border-color .22s ease">
        <Stack spacing={{ base: '10px', md: '12px' }} align="center" justify="space-between" textAlign="center" minW={0}>
          <Stack spacing={{ base: '7px', md: '9px' }} align="center" w="100%" minW={0}>
            {frontLogo}
            {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2} maxW="100%">{sponsor.name}</Text>}
            {sponsor.description && <Text color={muted} fontSize={{ base: '12px', md: 'sm' }} noOfLines={visual.descriptionLines} maxW="100%">{sponsor.description}</Text>}
          </Stack>

          <Stack spacing="8px" w="100%" align="center">
            {hasVideo && (
              <Button
                type="button"
                onClick={() => setIsFlipped(true)}
                leftIcon={<MdPlayCircleFilled />}
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
            <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} size="xs" />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
function SponsorStaticCard({ sponsor, visual, linkMax, muted }) {
  const [linksOpen, setLinksOpen] = useState(false);

  return (
    <Box key={sponsor.id} {...visual.card} border="1px solid" minW="0" overflow="hidden" position="relative" transition="transform .22s ease, box-shadow .22s ease, border-color .22s ease">
      <SimpleGrid columns={{ base: 1 }} spacing={{ base: '8px', md: '12px' }} alignItems="center" h="100%">
        <Stack direction={{ base: 'column', sm: 'row', md: 'column' }} spacing={{ base: '10px', sm: '12px', md: '6px' }} h="100%" align="center">
          <Box
            as="button"
            type="button"
            aria-label={linksOpen ? `Ocultar links de ${sponsor.name || 'patrocinador'}` : `Mostrar links de ${sponsor.name || 'patrocinador'}`}
            aria-expanded={linksOpen}
            onClick={() => setLinksOpen((current) => !current)}
            flex={{ base: 'initial', sm: '0 0 38%', md: 'initial' }}
            minW="0"
            w={{ base: '100%', sm: '38%', md: '100%' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="18px"
            position="relative"
            cursor="pointer"
            transition="transform .2s ease, box-shadow .2s ease"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'inset 0 0 0 1px rgba(56, 161, 105, .22)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'brand.200', outlineOffset: '3px' }}
          >
            {sponsor.logoUrl ? (
              <Image src={sponsor.logoUrl} alt={sponsor.name || 'Patrocinador'} h={logoSize(visual.logo).h} maxW="100%" objectFit="contain" pointerEvents="none" />
            ) : (
              <Box h={logoSize(visual.logo).placeholderH} w="100%" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center"><Text color={muted}>Logo</Text></Box>
            )}
            {sponsor.links?.length > 1 && (
              <Box position="absolute" right="6px" bottom="4px" bg="brand.500" color="white" borderRadius="full" px="8px" py="2px" fontSize="11px" fontWeight="900" boxShadow="0 8px 18px rgba(15, 23, 42, .18)">
                +{Math.min(sponsor.links.length, linkMax) - 1}
              </Box>
            )}
          </Box>
          <Stack spacing={{ base: '5px', md: '6px' }} align="center" textAlign="center" flex="1" minW="0" overflow="hidden" w="100%">
            {sponsor.name && <Text fontWeight="900" fontSize={visual.nameSize} noOfLines={2} maxW="100%">{sponsor.name}</Text>}
            {sponsor.description && <Text color={muted} fontSize={{ base: '11px', md: 'xs' }} noOfLines={visual.descriptionLines} maxW="100%">{sponsor.description}</Text>}
            <SponsorActionRow links={sponsor.links} max={linkMax} muted={muted} size="xs" isExpanded={linksOpen} onToggle={() => setLinksOpen((current) => !current)} />
          </Stack>
        </Stack>
      </SimpleGrid>
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

    return <SponsorStaticCard key={sponsor.id} sponsor={sponsor} visual={visual} linkMax={linkMax} muted={muted} />;
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
