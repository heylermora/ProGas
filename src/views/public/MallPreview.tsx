// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Icon, IconButton, Image, Link, Stack, Text, Tooltip } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdExplore, MdLink, MdStorefront } from 'react-icons/md';
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
const marquee = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
`;
const contactBurst = keyframes`
  from { opacity: 0; scale: .2; }
  70% { opacity: 1; scale: 1.14; }
  to { opacity: 1; scale: 1; }
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

  useEffect(() => {
    let mounted = true;
    getPreviewBusinesses()
      .then((items) => { if (mounted) setBusinesses(items); })
      .catch(() => { if (mounted) setBusinesses([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const previewBusinesses = businesses;
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

      <Box position="relative" overflow="hidden" mx={{ base: '-16px', md: '-24px' }} px={{ base: '16px', md: '24px' }}>
        <Flex w="max-content" py="6px" animation={previewBusinesses.length > 1 ? `${marquee} ${Math.max(38, previewBusinesses.length * 7)}s linear infinite` : undefined} animationPlayState={selectedBusinessId ? 'paused' : 'running'} _motionReduce={{ animation: 'none' }}>
          {[0, 1].map((copy) => (
          <Flex key={copy} gap="14px" pr="14px" aria-hidden={copy === 1 ? true : undefined} pointerEvents={copy === 1 ? 'none' : 'auto'}>
            {loading && [0, 1, 2, 3].map((item) => <Box key={item} flex="0 0 190px" h="92px" borderRadius="16px" bg="whiteAlpha.100" opacity={1 - item * .16} />)}
            {!loading && previewBusinesses.map((business) => {
              const selected = copy === 0 && selectedBusinessId === business.id;
              const contacts = (business.links || []).filter(Boolean).slice(0, 5);
              return (
                <Box key={`${copy}-${business.id}`} position="relative" flex={{ base: '0 0 188px', md: '0 0 224px' }} h={{ base: '142px', md: '150px' }} pt="22px">
                  <Flex as="button" type="button" tabIndex={copy === 1 ? -1 : 0} aria-label={`${selected ? 'Ocultar contactos de' : 'Ver contactos de'} ${business.name || 'negocio local'}`} aria-expanded={selected} onClick={() => copy === 0 && toggleBusiness(business.id)} w="100%" minH={{ base: '90px', md: '98px' }} p="11px" gap="10px" align="center" textAlign="left" borderRadius="16px" bg={selected ? 'white' : 'rgba(255,255,255,.91)'} color="navy.900" border="1px solid" borderColor={selected ? 'cyan.200' : 'whiteAlpha.700'} boxShadow={selected ? '0 12px 26px rgba(0,0,0,.28)' : '0 7px 18px rgba(0,0,0,.14)'} transition="all .2s ease" _hover={{ transform: 'translateY(-2px)', bg: 'white' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '2px' }}>
                    <Flex w={{ base: '52px', md: '58px' }} h={{ base: '52px', md: '58px' }} flex="0 0 auto" borderRadius="14px" bg="gray.50" align="center" justify="center" p="7px" overflow="hidden">
                      {business.logoUrl ? <Image src={business.logoUrl} alt="" maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="28px" color="brand.500" />}
                    </Flex>
                    <Stack spacing="4px" minW="0">
                      <Text fontWeight="800" fontSize="sm" noOfLines={2} lineHeight="1.12">{business.name || 'Negocio local'}</Text>
                      <Text color={selected ? 'cyan.600' : 'gray.500'} fontSize="9px" fontWeight="800" letterSpacing=".04em">{selected ? (contacts.length ? 'ELEGÍ UNA RED' : 'SIN REDES PUBLICADAS') : 'VER CONTACTOS'}</Text>
                    </Stack>
                  </Flex>
                  {selected && contacts.length > 0 && (
                    <Box position="absolute" inset="0" zIndex={4} pointerEvents="none">
                      {contacts.map((contact, index) => { const meta = linkMeta(contact); const positions = [
                        { left: '8px', top: '0' }, { left: '50%', top: '0', transform: 'translateX(-50%)' }, { right: '8px', top: '0' },
                        { left: '34px', bottom: '0' }, { right: '34px', bottom: '0' },
                      ]; return (
                        <Tooltip key={contact} label={meta.label} hasArrow>
                          <IconButton as={Link} href={hrefFor(contact)} isExternal={!hrefFor(contact).startsWith('mailto:')} aria-label={`${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} boxSize="16px" />} position="absolute" {...positions[index]} pointerEvents="auto" minW="36px" w="36px" h="36px" p="0" borderRadius="50%" color="white" border="2px solid" borderColor="white" boxShadow="0 8px 18px rgba(0,0,0,.28)" sx={{ background: meta.bg }} animation={`${contactBurst} .34s cubic-bezier(.2,.9,.2,1) ${index * 45}ms both`} _hover={{ marginTop: '-3px', textDecoration: 'none', filter: 'brightness(1.08)' }} />
                        </Tooltip>
                      ); })}
                    </Box>
                  )}
                </Box>
              );
            })}
            {!loading && !previewBusinesses.length && <Flex flex="1" minH="86px" p="14px" borderRadius="16px" border="1px dashed" borderColor="whiteAlpha.300" align="center" gap="10px"><Icon as={MdStorefront} boxSize="28px" color="cyan.200" /><Text fontSize="sm" color="whiteAlpha.700">Muy pronto encontrarás negocios locales en este espacio.</Text></Flex>}
          </Flex>
          ))}
        </Flex>
        {selectedBusinessId && <Text textAlign="center" color="whiteAlpha.600" fontSize="10px">El carrusel está pausado mientras revisás los contactos.</Text>}
      </Box>
    </Box>
  );
}
