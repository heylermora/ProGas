// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Stack, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdBolt, MdEmail, MdFavorite, MdFavoriteBorder, MdLink, MdLocalMall, MdMyLocation, MdSearch, MdStorefront } from 'react-icons/md';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];
const mapSpans = [2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 2];
const contactBubblePositions = [
  { top: '-10px', right: '-10px' },
  { top: '18px', right: '-26px' },
  { bottom: '-10px', right: '-10px' },
  { bottom: '18px', right: '-26px' },
];

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
  const [openContactId, setOpenContactId] = useState('');
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

      <Box bg={panelBg} borderRadius={{ base: '20px', md: '28px' }} p={{ base: '12px', md: '22px' }} boxShadow="lg" mb="22px" overflow="hidden">
        <Flex align="center" justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', sm: 'row' }}><Box><Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa del centro comercial</Heading><Text color={muted} fontSize="sm">Entrá a una zona para descubrir sus comercios.</Text></Box><Button size="sm" variant={selectedCategory ? 'outline' : 'solid'} colorScheme="brand" onClick={() => setSelectedCategory('')}>Ver todo</Button></Flex>
        <Box position="relative" display="grid" gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' }} gap={{ base: '8px', md: '10px' }} p={{ base: '8px', md: '14px' }} borderRadius="20px" bg="linear-gradient(135deg, #D9F99D 0%, #BBF7D0 45%, #BFDBFE 100%)" _before={{ content: '""', position: 'absolute', inset: { base: '18px', md: '28px' }, border: '16px solid rgba(255,255,255,.74)', borderRadius: '18px', pointerEvents: 'none' }}>
          <Flex gridColumn={{ base: 'span 2', sm: 'span 4', lg: 'span 6' }} py="7px" px="12px" align="center" justify="space-between" borderRadius="full" bg="whiteAlpha.900" color="gray.600" fontSize="xs" fontWeight="800" position="relative"><Text>ENTRADA PRINCIPAL · PLAZA CENTRAL</Text><Badge colorScheme="red" borderRadius="full"><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge></Flex>
          {BUSINESS_CATEGORIES.map((category, index) => {
            const selected = selectedCategory === category;
            const total = activeBusinesses.filter((business) => business.category === category).length;
            return <Button key={category} gridColumn={{ base: 'span 1', sm: 'span 1', lg: `span ${mapSpans[index]}` }} h="auto" minH={{ base: '94px', md: '112px' }} whiteSpace="normal" py="10px" px="8px" variant={selected ? 'solid' : 'unstyled'} bg={selected ? 'brand.500' : 'white'} color={selected ? 'white' : 'navy.700'} border="2px solid" borderColor={selected ? 'brand.500' : 'white'} boxShadow={selected ? '0 12px 20px rgba(49, 130, 206, .30)' : '0 5px 12px rgba(15, 23, 42, .16)'} onClick={() => setSelectedCategory(category)} display="flex" flexDirection="column" gap="3px" transition="all .18s ease" position="relative" zIndex={1} _hover={{ transform: 'translateY(-4px) scale(1.03)', borderColor: 'brand.300', boxShadow: '0 14px 24px rgba(15, 23, 42, .22)' }}><Text fontSize={{ base: '22px', md: '28px' }}>{categoryEmoji[index]}</Text><Text fontSize={{ base: '11px', md: 'xs' }} noOfLines={2}>{category}</Text><Badge fontSize="9px" colorScheme={selected ? 'whiteAlpha' : 'brand'}>{total} negocios</Badge>{total > 0 && <Box position="absolute" top="5px" right="5px" w="7px" h="7px" borderRadius="full" bg={selected ? 'yellow.300' : 'green.400'} boxShadow="0 0 0 3px rgba(255,255,255,.65)" />}</Button>;
          })}
          <Box gridColumn={{ base: 'span 2', sm: 'span 4', lg: 'span 6' }} py="6px" textAlign="center" borderRadius="full" bg="gray.700" color="white" fontSize="xs" fontWeight="800" position="relative">SALIDA · VOLVÉ PRONTO</Box>
        </Box>
      </Box>

      <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', md: 'row' }}><Stack spacing="0"><Heading fontSize={{ base: 'xl', md: '2xl' }}>{selectedCategory || 'Todos los negocios'}</Heading><Text color={muted} fontSize="sm">Guardá favoritos y abrí las burbujas para contactar cada comercio.</Text></Stack><InputGroup maxW="320px"><InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un negocio" bg={panelBg} /></InputGroup></Flex>
      {shownBusinesses.length ? <Box display="grid" gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }} gap="16px">
        {shownBusinesses.map((business) => {
          const isFavorite = favoriteIds.includes(business.id);
          const contactLinks = (business.links || []).filter(Boolean).slice(0, 4);
          const contactsOpen = openContactId === business.id;
          return <Box key={business.id} p="16px" borderRadius="22px" bg={panelBg} border="1px solid" borderColor="gray.100" boxShadow="md" transition="all .2s ease" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'brand.300' }}>
            <Flex gap="14px" align="center"><Box position="relative" w="72px" h="72px" flexShrink={0} overflow="visible"><IconButton aria-label={contactsOpen ? `Ocultar contactos de ${business.name}` : `Ver contactos de ${business.name}`} aria-expanded={contactsOpen} onClick={() => contactLinks.length && setOpenContactId((current) => current === business.id ? '' : business.id)} w="72px" h="72px" minW="72px" borderRadius="18px" overflow="hidden" bg="brand.50" cursor={contactLinks.length ? 'pointer' : 'default'} icon={business.logoUrl ? <Image src={business.logoUrl} alt={business.name} w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="32px" h="32px" color="brand.500" />} _hover={contactLinks.length ? { transform: 'scale(1.04)', boxShadow: '0 0 0 3px', boxShadowColor: 'brand.200' } : undefined} />{contactLinks.map((businessLink, index) => { const meta = linkMeta(businessLink); return <Tooltip key={businessLink} label={`Abrir ${meta.label}`} hasArrow><IconButton as="a" href={hrefFor(businessLink)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} />} bg={meta.bg} color="white" borderRadius="full" size="sm" position="absolute" zIndex={2} {...contactBubblePositions[index]} opacity={contactsOpen ? 1 : 0} visibility={contactsOpen ? 'visible' : 'hidden'} transform={contactsOpen ? 'scale(1)' : 'scale(.45)'} transition={`all .24s cubic-bezier(.2,.8,.2,1) ${contactsOpen ? index * 45 : 0}ms`} boxShadow="0 8px 16px rgba(15, 23, 42, .25)" _hover={{ transform: 'translateY(-3px) scale(1.1)', filter: 'brightness(1.08)' }} /></Tooltip>; })}</Box><Stack spacing="3px" minW="0" flex="1"><Badge w="fit-content" colorScheme="brand">{business.category}</Badge><Text fontWeight="900" fontSize="lg" noOfLines={1}>{business.name}</Text><Text color={muted} fontSize="sm" noOfLines={2}>{business.description || 'Negocio local disponible en el centro comercial.'}</Text>{contactLinks.length > 0 && <Text color="brand.500" fontSize="xs" fontWeight="800">{contactsOpen ? 'Elegí cómo contactar' : 'Tocá el logo para contactar'}</Text>}</Stack><IconButton aria-label={isFavorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={isFavorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={isFavorite ? 'red.400' : muted} onClick={() => toggleFavorite(business.id)} /></Flex>
          </Box>;
        })}
      </Box> : <Box textAlign="center" border="2px dashed" borderColor="brand.200" borderRadius="24px" p={{ base: '34px', md: '52px' }} bg={panelBg}><Text fontSize="44px">🏪</Text><Heading fontSize="xl" mt="8px">Esta zona está por desbloquearse</Heading><Text color={muted} mt="4px">Pronto habrá negocios para explorar aquí.</Text></Box>}
    </PublicPage>
  );
}
