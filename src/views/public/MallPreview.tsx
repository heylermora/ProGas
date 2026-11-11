import { sponsorLinks } from 'utils/sponsor';
import { SocialLinksRow } from 'components/social/SocialLink';
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Icon, Image, IconButton, SimpleGrid, Stack, Text, Spinner, usePrefersReducedMotion } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight, MdExplore, MdPause, MdPlayArrow, MdStorefront } from 'react-icons/md';
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
        const activeBusinesses = shuffled(items.filter((item) => item.active !== false));
        cachedBusinesses = activeBusinesses.length ? activeBusinesses : undefined;
        return activeBusinesses;
      })
      .finally(() => { businessesRequest = undefined; });
  }
  return businessesRequest;
};

const ctaPulse = keyframes`
  0%, 100% { box-shadow: 0 12px 28px rgba(250, 204, 21, .28), 0 0 0 0 rgba(253, 224, 71, .35); }
  50% { box-shadow: 0 16px 34px rgba(250, 204, 21, .42), 0 0 0 8px rgba(253, 224, 71, 0); }
`;
const revealBusinesses = keyframes`
  from { opacity: .35; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;
type MallPreviewProps = { compact?: boolean; embedded?: boolean };

export default function MallPreview({ compact = false, embedded = false }: MallPreviewProps) {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [businesses, setBusinesses] = useState<SponsorItem[]>(cachedBusinesses || []);
  const [loading, setLoading] = useState(!cachedBusinesses);
  const [selectedBusinessKey, setSelectedBusinessKey] = useState('');
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setError(false); setLoading(true); setAttempt(value => value + 1); }, []);

  useEffect(() => {
    let mounted = true;
    setError(false);
    getPreviewBusinesses()
      .then((items) => { if (mounted) setBusinesses(items); })
      .catch(() => { if (mounted) setError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [attempt]);

  const previewBusinesses = businesses;
  const pageCount = Math.ceil(businesses.length / 3);
  const currentPage = pageCount ? page % pageCount : 0;
  const visibleBusinesses = Array.from({ length: Math.min(3, businesses.length) }, (_, index) => businesses[(currentPage * 3 + index) % businesses.length]);
  const changePage = (direction: number) => {
    setSelectedBusinessKey('');
    setPage(previous => (previous + direction + pageCount) % pageCount);
  };
  useEffect(() => {
    if (pageCount <= 1 || prefersReducedMotion || paused || hovering || focused || selectedBusinessKey) return;
    const timer = window.setInterval(() => setPage(previous => (previous + 1) % pageCount), 6000);
    return () => window.clearInterval(timer);
  }, [pageCount, prefersReducedMotion, paused, hovering, focused, selectedBusinessKey]);
  const originLabels: Record<string, string> = {
    '/': 'Volver al inicio', '/customer/data': 'Volver a verificación', '/customer/info': 'Volver al cliente',
    '/customer/products': 'Volver al pedido', '/customer/view-order': 'Volver a consultar pedido',
  };
  const mallDestination = { pathname: '/mall', state: { from: location.pathname, fromLabel: originLabels[location.pathname] || 'Volver' } };
  const secondaryWindow = compact ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const toggleBusiness = (key: string) => setSelectedBusinessKey((current) => current === key ? '' : key);

  return (
    <Box as={embedded ? 'div' : 'section'} aria-label={embedded ? 'Negocios de Acosta' : undefined} aria-labelledby={embedded ? undefined : 'mall-preview-title'} position="relative" overflow="hidden" borderRadius={embedded ? '0' : { base: '22px', md: '28px' }} bg={embedded ? 'linear-gradient(0deg, #EEF3FF, rgba(238,243,255,.7))' : 'linear-gradient(128deg, #111936 0%, #222B64 58%, #3730A3 100%)'} color={embedded ? '#172554' : 'white'} p={{ base: '16px', md: compact ? '18px' : '24px' }} pt={embedded ? '0' : undefined} boxShadow={embedded ? 'none' : '0 16px 38px rgba(15, 23, 42, .16)'} border={embedded ? 'none' : '1px solid'} borderColor="whiteAlpha.200">
      <Box display={embedded ? 'none' : 'block'} position="absolute" inset="0" opacity=".18" pointerEvents="none" bgImage="radial-gradient(circle at 25% 25%, #fff 0 1px, transparent 1.5px)" bgSize="54px 54px" />
      {!embedded && <Flex position="relative" align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="14px" direction={{ base: 'column', md: 'row' }} mb={{ base: '18px', md: '20px' }}>
        <Flex gap="12px" align="center">
          <Flex w={{ base: '42px', md: '48px' }} h={{ base: '42px', md: '48px' }} flex="0 0 auto" borderRadius="16px" align="center" justify="center" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.300" fontSize={{ base: '23px', md: '27px' }}>🧑‍🚀</Flex>
          <Stack spacing="2px">
            <Heading id="mall-preview-title" fontSize={{ base: 'lg', md: compact ? 'xl' : '2xl' }}>Negocios de Acosta</Heading>
            {!compact && <Text color="whiteAlpha.700" fontSize="sm">Seleccione un negocio y contáctelo directamente.</Text>}
          </Stack>
        </Flex>
        <Button as={RLink} to={mallDestination} {...secondaryWindow} leftIcon={<MdExplore />} flexShrink={0} w={{ base: '100%', sm: 'auto' }} size="lg" borderRadius="full" bgGradient="linear(135deg, #FFF2A8 0%, #FACC15 48%, #E98A00 100%)" color="#281900" fontWeight="900" px="26px" animation={prefersReducedMotion ? undefined : `${ctaPulse} 2.3s ease-in-out infinite`} _hover={{ transform: 'translateY(-3px) scale(1.03)', filter: 'brightness(1.04)', textDecoration: 'none' }}>Explorar todos los negocios{compact ? ' ↗' : ''}</Button>
      </Flex>}

      {embedded && !loading && !error && previewBusinesses.length > 0 && <Text color="#475569" fontSize="sm" px="2px" mb="10px">Toque un logo para ver sus contactos.</Text>}
      {loading && <Flex role="status" aria-live="polite" minH="100px" align="center" justify="center" gap={3}>
        <Spinner size="sm" /><Text fontSize="sm">Cargando negocios…</Text>
      </Flex>}
      {error && <Flex role="alert" minH="100px" direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap={3} py={4}>
        <Text fontSize="sm">No pudimos cargar los negocios. Inténtelo nuevamente.</Text>
        <Button size="sm" onClick={retry} colorScheme="brand">Reintentar</Button>
      </Flex>}
      {!loading && !error && !previewBusinesses.length && <Flex role="status" minH="100px" align="center" justify="center" gap={3} py={4}>
        <Icon as={MdStorefront} boxSize="28px" /><Text fontSize="sm">Aún no hay negocios publicados.</Text>
      </Flex>}
      {!loading && !error && previewBusinesses.length > 0 && <Box position="relative" maxW="760px" mx="auto">
        <Box role="region" aria-label="Carrusel de negocios" aria-roledescription="carrusel" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}>
          <SimpleGrid key={currentPage} columns={Math.min(3, businesses.length)} spacing={{ base: '8px', md: '14px' }} py="4px" animation={prefersReducedMotion ? undefined : `${revealBusinesses} .3s ease-out`}>
            {visibleBusinesses.map(business => {
              const selected = selectedBusinessKey === business.id;
              return <Flex key={business.id} as="button" type="button" aria-label={`${selected ? 'Ocultar contactos de' : 'Ver contactos de'} ${business.name || 'negocio local'}`} aria-expanded={selected} onClick={() => toggleBusiness(business.id)}
                minW={0} w="100%" minH={{ base: '132px', md: '154px' }} p={{ base: '8px', md: '14px' }} gap="10px" direction="column" align="center" justify="center" textAlign="center"
                bg="white" color="navy.900" border="2px solid" borderColor={selected ? 'brand.500' : 'transparent'} borderRadius="14px" boxShadow="0 3px 10px rgba(15,23,42,.06)"
                _hover={{ borderColor: 'brand.200' }} _focusVisible={{ outline: '3px solid', outlineColor: 'brand.400', outlineOffset: '2px' }}>
                <Flex w="100%" h={{ base: '64px', md: '80px' }} flexShrink={0} align="center" justify="center">
                  {business.logoUrl ? <Image src={business.logoUrl} alt="" w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="36px" color="brand.500" />}
                </Flex>
                <Text w="100%" minH="32px" fontWeight="700" fontSize={{ base: '12px', md: 'sm' }} noOfLines={2} lineHeight="1.35" overflowWrap="normal" wordBreak="normal">{business.name || 'Negocio local'}</Text>
              </Flex>;
            })}
          </SimpleGrid>
          {pageCount > 1 && <Flex justify="center" align="center" gap={1} mt={2} color={embedded ? 'navy.900' : 'white'}>
            <IconButton variant="ghost" aria-label="Negocios anteriores" icon={<MdChevronLeft size={22} />} onClick={() => changePage(-1)} w="44px" h="44px" />
            <Text fontSize="xs" minW="44px" textAlign="center" aria-label={`Grupo ${currentPage + 1} de ${pageCount}`}>{currentPage + 1} / {pageCount}</Text>
            <IconButton variant="ghost" aria-label="Negocios siguientes" icon={<MdChevronRight size={22} />} onClick={() => changePage(1)} w="44px" h="44px" />
            {!prefersReducedMotion && <IconButton variant="ghost" aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'} aria-pressed={paused} icon={paused ? <MdPlayArrow size={18} /> : <MdPause size={18} />} onClick={() => setPaused(value => !value)} w="44px" h="44px" />}
          </Flex>}
        </Box>
        {previewBusinesses.filter(business => selectedBusinessKey === business.id).map(business => <Box key={business.id} mt={3} p={3} borderRadius="12px" bg={embedded ? 'white' : 'whiteAlpha.100'}>
          <Text fontSize="sm" fontWeight="700" mb={2}>Contactos de {business.name || 'Negocio local'}</Text>
          {sponsorLinks(business).length > 0 ? <SocialLinksRow links={sponsorLinks(business)} businessId={business.id} source="mall-preview" label={`Redes sociales de ${business.name}`} size="compact" appearance="carousel" /> : <Text fontSize="sm">Sin contactos publicados.</Text>}
        </Box>)}
      </Box>}

    </Box>
  );
}
