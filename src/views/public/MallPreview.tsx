// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, Heading, Icon, IconButton, Image, Link, Stack, Text, Tooltip } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight, MdEmail, MdExplore, MdLink, MdStorefront } from 'react-icons/md';
import SponsorItem from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';

let cachedBusinesses: SponsorItem[] | undefined;
let businessesRequest: Promise<SponsorItem[]> | undefined;

const shuffled = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

const getPreviewBusinesses = () => {
  if (cachedBusinesses) return Promise.resolve(cachedBusinesses);
  if (!businessesRequest) {
    businessesRequest = SponsorService.getAll()
      .then((items) => {
        cachedBusinesses = shuffled(items.filter((item) => item.active !== false));
        return cachedBusinesses;
      })
      .finally(() => { businessesRequest = undefined; });
  }
  return businessesRequest;
};

const ctaPulse = keyframes`
  0%, 100% { box-shadow: 0 12px 28px rgba(250, 204, 21, .28), 0 0 0 0 rgba(253, 224, 71, .35); }
  50% { box-shadow: 0 16px 34px rgba(250, 204, 21, .42), 0 0 0 8px rgba(253, 224, 71, 0); }
`;

const linkMeta = (link = '') => {
  const value = link.toLowerCase();
  if (value.includes('facebook.com')) return { label: 'Facebook', icon: FaFacebookF, bg: '#1877F2' };
  if (value.includes('instagram.com')) return { label: 'Instagram', icon: FaInstagram, bg: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)' };
  if (value.includes('whatsapp.com') || value.includes('wa.me')) return { label: 'WhatsApp', icon: FaWhatsapp, bg: '#25D366' };
  if (value.includes('tiktok.com')) return { label: 'TikTok', icon: FaTiktok, bg: '#111111' };
  if (value.startsWith('mailto:') || value.includes('@')) return { label: 'Correo', icon: MdEmail, bg: '#F97316' };
  if (value.startsWith('http')) return { label: 'Sitio web', icon: FaGlobe, bg: '#2563EB' };
  return { label: 'Contacto', icon: MdLink, bg: '#64748B' };
};

const hrefFor = (link = '') => link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;

type MallPreviewProps = { compact?: boolean };

export default function MallPreview({ compact = false }: MallPreviewProps) {
  const location = useLocation();
  const [businesses, setBusinesses] = useState<SponsorItem[]>(cachedBusinesses || []);
  const [loading, setLoading] = useState(!cachedBusinesses);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [interacting, setInteracting] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getPreviewBusinesses()
      .then((items) => { if (mounted) setBusinesses(items); })
      .catch(() => { if (mounted) setBusinesses([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const move = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 12;
    const atStart = track.scrollLeft <= 12;
    if ((direction > 0 && atEnd) || (direction < 0 && atStart)) {
      track.scrollTo({ left: direction > 0 ? 0 : track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: direction * 230, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (loading || businesses.length < 2 || selectedBusinessId || interacting) return undefined;
    const timer = window.setInterval(() => move(1), 4200);
    return () => window.clearInterval(timer);
  }, [loading, businesses.length, selectedBusinessId, interacting]);

  const previewBusinesses = businesses.slice(0, 12);
  const originLabels: Record<string, string> = {
    '/': 'Volver al inicio', '/customer/data': 'Volver a verificación', '/customer/info': 'Volver al cliente',
    '/customer/products': 'Volver al pedido', '/customer/view-order': 'Volver a consultar pedido',
  };
  const mallDestination = { pathname: '/mall', state: { from: location.pathname, fromLabel: originLabels[location.pathname] || 'Volver' } };
  const secondaryWindow = compact ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const toggleBusiness = (id: string) => setSelectedBusinessId((current) => current === id ? '' : id);

  return (
    <Box as="section" aria-labelledby="mall-preview-title" position="relative" overflow="hidden" borderRadius={{ base: '22px', md: '28px' }} bg="linear-gradient(128deg, #111936 0%, #222B64 58%, #3730A3 100%)" color="white" p={{ base: '16px', md: compact ? '18px' : '24px' }} boxShadow="0 16px 38px rgba(15, 23, 42, .16)" border="1px solid" borderColor="whiteAlpha.200">
      <Box position="absolute" inset="0" opacity=".18" pointerEvents="none" bgImage="radial-gradient(circle at 25% 25%, #fff 0 1px, transparent 1.5px)" bgSize="54px 54px" />
      <Flex position="relative" align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="14px" direction={{ base: 'column', md: 'row' }} mb={{ base: '18px', md: '20px' }}>
        <Flex gap="12px" align="center">
          <Flex w={{ base: '42px', md: '48px' }} h={{ base: '42px', md: '48px' }} flex="0 0 auto" borderRadius="16px" align="center" justify="center" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.300" fontSize={{ base: '23px', md: '27px' }}>🧑‍🚀</Flex>
          <Stack spacing="2px">
            <Heading id="mall-preview-title" fontSize={{ base: 'lg', md: compact ? 'xl' : '2xl' }}>Negocios de nuestra comunidad</Heading>
            {!compact && <Text color="whiteAlpha.700" fontSize="sm">Descubrí emprendimientos de Acosta. Tocá uno para ver cómo contactarlo.</Text>}
          </Stack>
        </Flex>
        <Button as={RLink} to={mallDestination} {...secondaryWindow} leftIcon={<MdExplore />} flexShrink={0} w={{ base: '100%', sm: 'auto' }} size="lg" borderRadius="full" bgGradient="linear(135deg, #FFF2A8 0%, #FACC15 48%, #E98A00 100%)" color="#281900" fontWeight="900" px="26px" animation={`${ctaPulse} 2.3s ease-in-out infinite`} _motionReduce={{ animation: 'none' }} _hover={{ transform: 'translateY(-3px) scale(1.03)', filter: 'brightness(1.04)', textDecoration: 'none' }}>Explorar todos los negocios{compact ? ' ↗' : ''}</Button>
      </Flex>

      <Flex position="relative" align="center" gap={{ base: '6px', md: '9px' }} onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
        {!loading && previewBusinesses.length > 1 && <CarouselButton direction="previous" onClick={() => move(-1)} />}
        <Box flex="1" minW="0" overflow="hidden">
          <Flex ref={trackRef} gap="12px" overflowX="auto" scrollSnapType="x mandatory" py="5px" px="2px" sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {loading && [0, 1, 2, 3].map((item) => <Box key={item} flex="0 0 190px" h="92px" borderRadius="16px" bg="whiteAlpha.100" opacity={1 - item * .16} />)}
            {!loading && previewBusinesses.map((business) => {
              const selected = selectedBusinessId === business.id;
              const contacts = (business.links || []).filter(Boolean).slice(0, 5);
              return (
                <Box key={business.id} position="relative" scrollSnapAlign="start" flex={{ base: '0 0 180px', md: '0 0 220px' }} pb={selected && contacts.length ? '24px' : '0'} transition="padding .2s ease">
                  <Flex as="button" type="button" aria-label={`${selected ? 'Ocultar contactos de' : 'Ver contactos de'} ${business.name || 'negocio local'}`} aria-expanded={selected} onClick={() => toggleBusiness(business.id)} w="100%" minH={{ base: '90px', md: '98px' }} p="11px" gap="10px" align="center" textAlign="left" borderRadius="16px" bg={selected ? 'white' : 'rgba(255,255,255,.91)'} color="navy.900" border="1px solid" borderColor={selected ? 'cyan.200' : 'whiteAlpha.700'} boxShadow={selected ? '0 12px 26px rgba(0,0,0,.28)' : '0 7px 18px rgba(0,0,0,.14)'} transition="all .2s ease" _hover={{ transform: 'translateY(-2px)', bg: 'white' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '2px' }}>
                    <Flex w={{ base: '52px', md: '58px' }} h={{ base: '52px', md: '58px' }} flex="0 0 auto" borderRadius="14px" bg="gray.50" align="center" justify="center" p="7px" overflow="hidden">
                      {business.logoUrl ? <Image src={business.logoUrl} alt="" maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="28px" color="brand.500" />}
                    </Flex>
                    <Stack spacing="4px" minW="0">
                      <Text fontWeight="800" fontSize="sm" noOfLines={2} lineHeight="1.12">{business.name || 'Negocio local'}</Text>
                      <Text color={selected ? 'cyan.600' : 'gray.500'} fontSize="9px" fontWeight="800" letterSpacing=".04em">{selected ? (contacts.length ? 'ELEGÍ UNA RED' : 'SIN REDES PUBLICADAS') : 'VER CONTACTOS'}</Text>
                    </Stack>
                  </Flex>
                  {selected && contacts.length > 0 && (
                    <Flex position="absolute" left="50%" bottom="20px" transform="translate(-50%, 50%)" zIndex={4} gap="5px" px="7px" py="5px" borderRadius="full" bg="rgba(7,11,31,.92)" border="1px solid" borderColor="whiteAlpha.300" boxShadow="0 8px 18px rgba(0,0,0,.30)" backdropFilter="blur(8px)">
                      {contacts.map((contact) => { const meta = linkMeta(contact); return (
                        <Tooltip key={contact} label={meta.label} hasArrow>
                          <IconButton as={Link} href={hrefFor(contact)} isExternal={!hrefFor(contact).startsWith('mailto:')} aria-label={`${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} boxSize="15px" />} size="xs" minW="30px" w="30px" h="30px" borderRadius="full" color="white" sx={{ background: meta.bg }} _hover={{ transform: 'translateY(-2px)', textDecoration: 'none', filter: 'brightness(1.08)' }} />
                        </Tooltip>
                      ); })}
                    </Flex>
                  )}
                </Box>
              );
            })}
            {!loading && !previewBusinesses.length && <Flex flex="1" minH="86px" p="14px" borderRadius="16px" border="1px dashed" borderColor="whiteAlpha.300" align="center" gap="10px"><Icon as={MdStorefront} boxSize="28px" color="cyan.200" /><Text fontSize="sm" color="whiteAlpha.700">Muy pronto encontrarás negocios locales en este espacio.</Text></Flex>}
          </Flex>
          {selectedBusinessId && <Text textAlign="center" color="whiteAlpha.600" fontSize="10px" mt="14px">El carrusel está pausado mientras revisás los contactos.</Text>}
        </Box>
        {!loading && previewBusinesses.length > 1 && <CarouselButton direction="next" onClick={() => move(1)} />}
      </Flex>
    </Box>
  );
}

function CarouselButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const previous = direction === 'previous';
  return <IconButton aria-label={previous ? 'Ver negocios anteriores' : 'Ver más negocios'} icon={<Icon as={previous ? MdChevronLeft : MdChevronRight} boxSize="22px" />} flex="0 0 auto" display={{ base: 'none', sm: 'inline-flex' }} w="36px" h="36px" minW="36px" borderRadius="full" variant="ghost" bg="whiteAlpha.100" color="whiteAlpha.800" border="1px solid" borderColor="whiteAlpha.300" onClick={onClick} _hover={{ bg: 'whiteAlpha.200', color: 'white', transform: 'scale(1.04)' }} _focusVisible={{ outline: '2px solid', outlineColor: 'cyan.200', outlineOffset: '2px' }} />;
}
