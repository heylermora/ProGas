// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, SimpleGrid, Stack, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdArrowForward, MdBolt, MdEmail, MdFavorite, MdFavoriteBorder, MdLink, MdLocalMall, MdSearch, MdStorefront } from 'react-icons/md';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];

const hrefFor = (link = '') => link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link;
const linkMeta = (link = '') => {
  const value = link.toLowerCase();
  if (value.includes('facebook.com')) return { label: 'Facebook', icon: FaFacebookF, bg: '#1877F2' };
  if (value.includes('instagram.com')) return { label: 'Instagram', icon: FaInstagram, bg: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)' };
  if (value.includes('whatsapp.com') || value.includes('wa.me')) return { label: 'WhatsApp', icon: FaWhatsapp, bg: '#25D366' };
  if (value.includes('tiktok.com')) return { label: 'TikTok', icon: FaTiktok, bg: '#111111' };
  if (value.startsWith('mailto:') || value.includes('@')) return { label: 'Correo', icon: MdEmail, bg: '#F97316' };
  if (value.includes('http')) return { label: 'Sitio web', icon: FaGlobe, bg: '#2563EB' };
  return { label: 'Contacto', icon: MdLink, bg: '#64748B' };
};

export default function VirtualMall() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [query, setQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const panelBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => { SponsorService.getAll().then(setBusinesses).catch(() => setBusinesses([])); }, []);

  const activeBusinesses = useMemo(() => businesses.filter((business) => business.active !== false), [businesses]);
  const shownBusinesses = activeBusinesses.filter((business) => {
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    const search = query.trim().toLowerCase();
    return matchesCategory && (!search || `${business.name} ${business.description || ''} ${business.category}`.toLowerCase().includes(search));
  });
  const toggleFavorite = (businessId) => setFavoriteIds((current) => current.includes(businessId) ? current.filter((id) => id !== businessId) : [...current, businessId]);

  return (
    <PublicPage maxW="1280px">
      <Box borderRadius={{ base: '24px', md: '32px' }} overflow="hidden" p={{ base: '22px', md: '36px' }} bgGradient="linear(135deg, #1A365D 0%, #2B6CB0 48%, #38A169 100%)" color="white" mb="22px" position="relative">
        <Box position="absolute" right="-32px" top="-48px" fontSize="180px" opacity=".12">🕹️</Box>
        <Stack spacing="12px" maxW="680px" position="relative">
          <Badge w="fit-content" px="10px" py="4px" borderRadius="full" bg="whiteAlpha.300" color="white"><Icon as={MdBolt} mr="4px" />NIVEL LOCAL</Badge>
          <Heading fontSize={{ base: '32px', md: '52px' }} lineHeight="1.02">Centro Comercial Virtual</Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.900">Explorá negocios locales, desbloqueá tus favoritos y conectá con ellos en segundos.</Text>
          <Flex align="center" gap="8px" fontWeight="800"><Icon as={MdStorefront} /><Text>{activeBusinesses.length} negocios disponibles · {favoriteIds.length} favoritos</Text></Flex>
        </Stack>
      </Box>

      <Box bg={panelBg} borderRadius="24px" p={{ base: '16px', md: '22px' }} boxShadow="lg" mb="22px">
        <Flex align="center" justify="space-between" mb="14px" gap="12px"><Heading fontSize={{ base: 'lg', md: 'xl' }}>Elegí una zona</Heading><Button size="sm" variant={selectedCategory ? 'outline' : 'solid'} colorScheme="brand" onClick={() => setSelectedCategory('')}>Ver todo</Button></Flex>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing="10px">
          {BUSINESS_CATEGORIES.map((category, index) => {
            const selected = selectedCategory === category;
            const total = activeBusinesses.filter((business) => business.category === category).length;
            return <Button key={category} h="auto" minH="92px" whiteSpace="normal" py="10px" variant={selected ? 'solid' : 'outline'} colorScheme={selected ? 'brand' : 'gray'} onClick={() => setSelectedCategory(category)} display="flex" flexDirection="column" gap="3px"><Text fontSize="24px">{categoryEmoji[index]}</Text><Text fontSize="xs" noOfLines={2}>{category}</Text><Badge fontSize="9px" colorScheme={selected ? 'whiteAlpha' : 'brand'}>{total}</Badge></Button>;
          })}
        </SimpleGrid>
      </Box>

      <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', md: 'row' }}><Stack spacing="0"><Heading fontSize={{ base: 'xl', md: '2xl' }}>{selectedCategory || 'Todos los negocios'}</Heading><Text color={muted} fontSize="sm">Guardá favoritos y abrí las burbujas para contactar cada comercio.</Text></Stack><InputGroup maxW="320px"><InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un negocio" bg={panelBg} /></InputGroup></Flex>
      {shownBusinesses.length ? <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing="16px">
        {shownBusinesses.map((business) => {
          const link = business.links?.find(Boolean);
          const isFavorite = favoriteIds.includes(business.id);
          return <Box key={business.id} p="16px" borderRadius="22px" bg={panelBg} border="1px solid" borderColor="gray.100" boxShadow="md" transition="all .2s ease" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'brand.300' }}>
            <Flex gap="14px" align="center"><Box w="72px" h="72px" borderRadius="18px" overflow="hidden" bg="brand.50" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>{business.logoUrl ? <Image src={business.logoUrl} alt={business.name} w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="32px" h="32px" color="brand.500" />}</Box><Stack spacing="3px" minW="0" flex="1"><Badge w="fit-content" colorScheme="brand">{business.category}</Badge><Text fontWeight="900" fontSize="lg" noOfLines={1}>{business.name}</Text><Text color={muted} fontSize="sm" noOfLines={2}>{business.description || 'Negocio local disponible en el centro comercial.'}</Text></Stack><IconButton aria-label={isFavorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={isFavorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={isFavorite ? 'red.400' : muted} onClick={() => toggleFavorite(business.id)} /></Flex>
            <Flex mt="14px" align="center" justify="space-between" gap="10px"><Flex gap="7px" flexWrap="wrap">{(business.links || []).filter(Boolean).slice(0, 4).map((businessLink) => { const meta = linkMeta(businessLink); return <Tooltip key={businessLink} label={meta.label} hasArrow><IconButton as="a" href={hrefFor(businessLink)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} />} bg={meta.bg} color="white" borderRadius="full" size="sm" _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.08)' }} /></Tooltip>; })}</Flex><Button as="a" href={hrefFor(link || '')} isDisabled={!link} target="_blank" rel="noopener noreferrer" rightIcon={<MdArrowForward />} colorScheme="brand" size="sm">Visitar</Button></Flex>
          </Box>;
        })}
      </SimpleGrid> : <Box textAlign="center" border="2px dashed" borderColor="brand.200" borderRadius="24px" p={{ base: '34px', md: '52px' }} bg={panelBg}><Text fontSize="44px">🏪</Text><Heading fontSize="xl" mt="8px">Esta zona está por desbloquearse</Heading><Text color={muted} mt="4px">Pronto habrá negocios para explorar aquí.</Text></Box>}
    </PublicPage>
  );
}
