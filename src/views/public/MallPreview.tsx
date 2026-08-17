// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdChevronLeft, MdChevronRight, MdExplore, MdStorefront } from 'react-icons/md';
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

type MallPreviewProps = {
  compact?: boolean;
};

export default function MallPreview({ compact = false }: MallPreviewProps) {
  const location = useLocation();
  const [businesses, setBusinesses] = useState<SponsorItem[]>(cachedBusinesses || []);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(!cachedBusinesses);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getPreviewBusinesses()
      .then((items) => { if (mounted) setBusinesses(items); })
      .catch(() => { if (mounted) setBusinesses([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const move = (direction: number) => trackRef.current?.scrollBy({ left: direction * 250, behavior: 'smooth' });
  const categories = Array.from(new Set(businesses.map((business) => business.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const previewBusinesses = businesses
    .filter((business) => !selectedCategory || business.category === selectedCategory)
    .slice(0, 12);
  const chooseCategory = (category: string) => {
    setSelectedCategory(category);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const originLabels: Record<string, string> = {
    '/': 'Volver al inicio',
    '/customer/data': 'Volver a verificación',
    '/customer/info': 'Volver al cliente',
    '/customer/products': 'Volver al pedido',
    '/customer/view-order': 'Volver a consultar pedido',
  };
  const mallDestination = { pathname: '/mall', state: { from: location.pathname, fromLabel: originLabels[location.pathname] || 'Volver' } };
  const stationDestination = (business: SponsorItem) => ({
    pathname: '/mall',
    search: `?business=${encodeURIComponent(business.id || '')}`,
    state: { from: location.pathname, fromLabel: originLabels[location.pathname] || 'Volver' },
  });
  const secondaryWindow = compact ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Box
      as="section"
      aria-labelledby="mall-preview-title"
      position="relative"
      overflow="hidden"
      borderRadius={{ base: '22px', md: '28px' }}
      bg="radial-gradient(circle at 86% 18%, #4338CA 0%, #172554 42%, #070B1F 100%)"
      color="white"
      p={{ base: '16px', md: compact ? '18px' : '24px' }}
      boxShadow="0 18px 44px rgba(15, 23, 42, .18)"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Box position="absolute" inset="0" opacity=".55" pointerEvents="none" bgImage="radial-gradient(circle at 12% 20%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #fff 0 1px, transparent 2px)" bgSize="44px 44px, 61px 61px" />
      <Flex position="relative" align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="12px" direction={{ base: 'column', md: 'row' }} mb="14px">
        <Flex gap="12px" align="center">
          <Flex w={{ base: '44px', md: '52px' }} h={{ base: '44px', md: '52px' }} flex="0 0 auto" borderRadius="full" align="center" justify="center" bg="whiteAlpha.200" border="1px solid" borderColor="cyan.200" fontSize={{ base: '25px', md: '30px' }}>🧑‍🚀</Flex>
          <Stack spacing="2px">
            <Heading id="mall-preview-title" fontSize={{ base: 'lg', md: compact ? 'xl' : '2xl' }}>Descubre nuestra comunidad</Heading>
            {!compact && <Text color="whiteAlpha.800" fontSize="sm">Una galaxia de comercios locales te espera en el centro comercial virtual.</Text>}
          </Stack>
        </Flex>
        <Button as={RLink} to={mallDestination} {...secondaryWindow} leftIcon={<MdExplore />} flexShrink={0} w={{ base: '100%', sm: 'auto' }} borderRadius="full" bgGradient="linear(135deg, #FFE29F 0%, #D4AF37 48%, #8A5A00 100%)" color="white" boxShadow="0 12px 24px rgba(184,134,11,.34)" _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.06)' }}>Explorar el mapa{compact ? ' ↗' : ''}</Button>
      </Flex>

      {!loading && categories.length > 1 && (
        <Flex position="relative" gap="7px" mb="12px" overflowX="auto" pb="2px" scrollSnapType="x proximity" sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Button aria-pressed={!selectedCategory} onClick={() => chooseCategory('')} flex="0 0 auto" scrollSnapAlign="start" size="xs" px="13px" borderRadius="full" bg={!selectedCategory ? 'cyan.300' : 'whiteAlpha.150'} color={!selectedCategory ? 'navy.900' : 'white'} border="1px solid" borderColor={!selectedCategory ? 'cyan.200' : 'whiteAlpha.300'} _hover={{ bg: !selectedCategory ? 'cyan.200' : 'whiteAlpha.250' }}>Todos</Button>
          {categories.map((category) => (
            <Button key={category} aria-pressed={selectedCategory === category} onClick={() => chooseCategory(category)} flex="0 0 auto" scrollSnapAlign="start" size="xs" px="13px" borderRadius="full" bg={selectedCategory === category ? 'cyan.300' : 'whiteAlpha.150'} color={selectedCategory === category ? 'navy.900' : 'white'} border="1px solid" borderColor={selectedCategory === category ? 'cyan.200' : 'whiteAlpha.300'} _hover={{ bg: selectedCategory === category ? 'cyan.200' : 'whiteAlpha.250' }}>{category}</Button>
          ))}
        </Flex>
      )}

      <Flex align="center" gap={{ base: '7px', md: '10px' }}>
        {!loading && previewBusinesses.length > 1 && <CarouselButton direction="previous" onClick={() => move(-1)} />}
        <Box flex="1" minW="0" overflow="hidden">
          <Flex ref={trackRef} gap="10px" overflowX="auto" scrollSnapType="x mandatory" pb="3px" sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {loading && [0, 1, 2, 3].map((item) => <Box key={item} flex="0 0 190px" h="96px" borderRadius="18px" bg="whiteAlpha.200" opacity={1 - item * .14} />)}
            {!loading && previewBusinesses.map((business) => (
              <Flex key={business.id} as={RLink} to={stationDestination(business)} {...secondaryWindow} aria-label={`Ver estación de ${business.name || 'negocio local'}`} scrollSnapAlign="start" flex={{ base: '0 0 178px', md: '0 0 210px' }} minW="0" minH={{ base: '94px', md: '104px' }} p="10px" gap="10px" align="center" borderRadius="18px" bg="rgba(255,255,255,.94)" color="navy.900" border="2px solid" borderColor="white" boxShadow="0 10px 24px rgba(0,0,0,.22)" transition="transform .2s ease, box-shadow .2s ease" _hover={{ textDecoration: 'none', transform: 'translateY(-3px)', boxShadow: '0 15px 30px rgba(0,0,0,.30)' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '3px' }}>
                <Flex w={{ base: '54px', md: '62px' }} h={{ base: '54px', md: '62px' }} flex="0 0 auto" borderRadius="16px" bg="gray.50" align="center" justify="center" p="7px" overflow="hidden">
                  {business.logoUrl ? <Image src={business.logoUrl} alt="" maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="30px" color="brand.500" />}
                </Flex>
                <Stack spacing="3px" minW="0">
                  <Text fontWeight="900" fontSize="sm" noOfLines={2} lineHeight="1.08">{business.name || 'Negocio local'}</Text>
                  <Text color="brand.500" fontSize="9px" fontWeight="900">VER ESTACIÓN</Text>
                </Stack>
              </Flex>
            ))}
            {!loading && !previewBusinesses.length && (
              <Flex flex="1" minH="86px" p="14px" borderRadius="18px" border="1px dashed" borderColor="whiteAlpha.400" align="center" gap="10px"><Icon as={MdStorefront} boxSize="28px" color="cyan.200" /><Text fontSize="sm" color="whiteAlpha.800">Muy pronto encontrarás negocios locales en este mapa.</Text></Flex>
            )}
          </Flex>
        </Box>
        {!loading && previewBusinesses.length > 1 && <CarouselButton direction="next" onClick={() => move(1)} />}
      </Flex>
    </Box>
  );
}

function CarouselButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }) {
  const previous = direction === 'previous';
  return (
    <IconButton
      aria-label={previous ? 'Ver negocios anteriores' : 'Ver más negocios'}
      icon={<Icon as={previous ? MdChevronLeft : MdChevronRight} boxSize="26px" />}
      flex="0 0 auto"
      display={{ base: 'none', sm: 'inline-flex' }}
      w={{ base: '40px', md: '46px' }}
      h={{ base: '40px', md: '46px' }}
      minW={{ base: '40px', md: '46px' }}
      borderRadius="full"
      bg="rgba(8,14,38,.90)"
      color="yellow.200"
      border="1px solid"
      borderColor="yellow.300"
      boxShadow="0 10px 24px rgba(0,0,0,.38), 0 0 0 4px rgba(250,204,21,.10)"
      backdropFilter="blur(10px)"
      onClick={onClick}
      _hover={{ bg: 'yellow.400', color: 'navy.900', transform: 'scale(1.06)' }}
      _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '3px' }}
    />
  );
}
