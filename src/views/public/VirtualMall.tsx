// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Badge, Box, Button, Flex, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, SimpleGrid, Stack, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdBolt, MdEmail, MdFavorite, MdFavoriteBorder, MdLink, MdLocalMall, MdMyLocation, MdSearch, MdStorefront } from 'react-icons/md';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];
const categoryShortLabels = ['Rest. / sodas', 'Comidas rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías', 'Licoreras', 'Súperes', 'Tiendas', 'Joyerías', 'Zapaterías', 'Barberías', 'Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agroinsumos', 'Gimnasios', 'Motos', 'Mecánicos', 'Fumigadoras', 'Otros'];
const mapPositions = [
  [8, 12], [26, 10], [45, 12], [64, 10], [84, 12],
  [9, 31], [26, 30], [74, 30], [91, 31],
  [8, 50], [25, 52], [75, 52], [92, 50],
  [9, 70], [27, 72], [73, 72], [91, 70],
  [16, 88], [38, 88], [62, 88], [84, 88],
];
const playerPulse = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.08); }
`;
const playerShadow = keyframes`
  0%, 100% { transform: translateX(-50%) scale(.95); opacity: .32; }
  50% { transform: translateX(-50%) scale(.62); opacity: .16; }
`;

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
  const activeMapIndex = Math.max(0, BUSINESS_CATEGORIES.indexOf(selectedCategory));
  const [playerLeft, selectedTop] = selectedCategory ? mapPositions[activeMapIndex] : [50, 51];
  const playerTop = selectedCategory ? Math.min(selectedTop + 7, 90) : selectedTop;
  const mapPath = [0, 1, 2, 3, 4, 8, 12, 16, 20, 19, 18, 17, 13, 9, 5, 6, 7, 11, 15, 14, 10]
    .map((index) => mapPositions[index].join(','))
    .join(' ');

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
        <Box mb="14px"><Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa galáctico</Heading><Text color={muted} fontSize="sm">Tocá una estación para mover al astronauta. Las líneas conectan todas las categorías; tocá la plaza para regresar.</Text></Box>
        <Box display="block">
          <Box position="relative" w="100%" h={{ base: '460px', md: '590px', lg: '620px' }} borderRadius="24px" overflow="hidden" bg="radial-gradient(circle at 50% 50%, #4338CA 0%, #1E1B4B 35%, #0B1026 74%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .8, bgImage: 'radial-gradient(circle at 12% 20%, #ffffff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #ffffff 0 1px, transparent 2px), radial-gradient(circle at 42% 88%, #ffffff 0 1.5px, transparent 2.5px)', bgSize: '42px 42px, 58px 58px, 73px 73px' }}>
            <Box as="svg" viewBox="0 0 100 100" preserveAspectRatio="none" position="absolute" inset="4%" w="92%" h="92%" opacity=".72" pointerEvents="none"><polyline points={mapPath} fill="none" stroke="#67E8F9" strokeWidth=".55" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.2 1.2" /></Box>
            <Box position="absolute" left="5%" right="5%" top="45%" h={{ base: '34px', md: '58px' }} bg="cyan.300" opacity=".18" borderY={{ base: '4px solid', md: '8px solid' }} borderColor="cyan.100" transform="rotate(-4deg)" />
            <Box position="absolute" top="7%" bottom="7%" left="47%" w={{ base: '34px', md: '58px' }} bg="cyan.300" opacity=".18" borderX={{ base: '4px solid', md: '8px solid' }} borderColor="cyan.100" transform="rotate(5deg)" />
            <Box as="button" type="button" aria-label="Volver a la plaza central" onClick={() => setSelectedCategory('')} position="absolute" left="39%" top="39%" w="22%" h="22%" borderRadius="full" bg="purple.300" border={{ base: '4px solid', md: '8px solid' }} borderColor="yellow.300" boxShadow="0 0 30px rgba(250, 204, 21, .55), inset 0 0 0 6px rgba(255,255,255,.25)" display="flex" alignItems="center" justifyContent="center" cursor="pointer" transition="transform .2s ease, filter .2s ease" _hover={{ transform: 'scale(1.05)', filter: 'brightness(1.08)' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '4px' }}><Stack align="center" spacing="0"><Text fontSize={{ base: '20px', md: '32px' }}>🪐</Text><Text display={{ base: 'none', sm: 'block' }} fontSize="xs" fontWeight="900" color="white">PLAZA CENTRAL</Text></Stack></Box>
            {BUSINESS_CATEGORIES.map((category, index) => {
              const selected = selectedCategory === category;
              const total = activeBusinesses.filter((business) => business.category === category).length;
              const [left, top] = mapPositions[index];
              return <Button key={category} aria-label={`Ir a ${category}, ${total} negocios`} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '42px', md: '88px', lg: '96px' }} h={{ base: '42px', md: '76px', lg: '82px' }} minW={{ base: '42px', md: '88px', lg: '96px' }} minH={{ base: '42px', md: '76px', lg: '82px' }} p={{ base: 0, md: '5px' }} variant="unstyled" bg={selected ? 'brand.500' : 'whiteAlpha.900'} color={selected ? 'white' : 'navy.700'} border="3px solid" borderColor={selected ? 'cyan.200' : 'white'} borderRadius={{ base: 'full', md: '16px' }} boxShadow={selected ? '0 0 0 5px rgba(103, 232, 249, .24), 0 0 22px rgba(103, 232, 249, .95)' : '0 0 12px rgba(255,255,255,.55)'} onClick={() => setSelectedCategory(category)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="1px" transition="all .28s cubic-bezier(.2,.8,.2,1)" zIndex={2} _hover={{ transform: 'translate(-50%, -50%) scale(1.10)', boxShadow: '0 0 0 6px rgba(103, 232, 249, .30), 0 0 26px rgba(103, 232, 249, 1)' }}><Text fontSize={{ base: '19px', md: '24px', lg: '28px' }}>{categoryEmoji[index]}</Text><Text display={{ base: 'none', md: 'block' }} maxW="100%" noOfLines={1} fontSize={{ md: '9px', lg: '10px' }} fontWeight="900">{categoryShortLabels[index]}</Text><Text display={{ base: 'none', lg: 'block' }} fontSize="8px" color={selected ? 'whiteAlpha.900' : 'gray.500'}>{total} negocios</Text>{total > 0 && <Box position="absolute" top="2px" right="2px" w={{ base: '7px', md: '9px' }} h={{ base: '7px', md: '9px' }} borderRadius="full" bg="green.400" boxShadow="0 0 0 3px rgba(255,255,255,.72)" />}</Button>;
            })}
            <Stack position="absolute" left={`${playerLeft}%`} top={`${playerTop}%`} transform="translate(-50%, -50%)" w={{ base: '76px', md: '106px' }} align="center" spacing="0" zIndex={4} transition="left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)" pointerEvents="none"><Badge whiteSpace="nowrap" colorScheme="red" borderRadius="full" boxShadow="sm" fontSize={{ base: '8px', md: 'xs' }} mb={{ base: '-2px', md: 0 }}><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge><Box position="relative" w={{ base: '44px', md: '60px' }} h={{ base: '38px', md: '54px' }} display="flex" justifyContent="center"><Box position="absolute" bottom="1px" left="50%" w={{ base: '24px', md: '36px' }} h={{ base: '7px', md: '10px' }} borderRadius="full" bg="blackAlpha.400" animation={`${playerShadow} 1s ease-in-out infinite`} /><Box position="relative" zIndex={1} animation={`${playerPulse} 1s ease-in-out infinite`} fontSize={{ base: '28px', md: '42px' }} lineHeight="1">🧑‍🚀</Box></Box></Stack>
          </Box>
          <Flex mt="12px" px={{ base: '12px', md: '16px' }} py="10px" borderRadius="14px" bg="navy.800" color="white" align={{ base: 'flex-start', sm: 'center' }} justify="space-between" direction={{ base: 'column', sm: 'row' }} gap="4px"><Text fontSize="10px" letterSpacing=".08em" color="cyan.200" fontWeight="900">DESTINO ACTUAL</Text><Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="800">{selectedCategory || 'Plaza central'}</Text><Text fontSize="xs" color="whiteAlpha.800">Tocá otra estación para viajar.</Text></Flex>
        </Box>
        <Box display="none" p="10px" borderRadius="18px" bg="linear-gradient(135deg, #B7E4C7, #90DBF4)">
          <Flex px="10px" py="7px" mb="10px" borderRadius="full" bg="whiteAlpha.900" align="center" justify="space-between" fontSize="xs" fontWeight="800" color="gray.700"><Text>MINIMAPA · ZONAS</Text><Badge colorScheme="red"><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge></Flex>
          <SimpleGrid columns={2} spacing="8px">
            {BUSINESS_CATEGORIES.map((category, index) => {
              const selected = selectedCategory === category;
              const total = activeBusinesses.filter((business) => business.category === category).length;
              return <Button key={category} minH="86px" h="auto" p="8px" whiteSpace="normal" variant="unstyled" bg={selected ? 'brand.500' : 'white'} color={selected ? 'white' : 'navy.700'} border="2px solid" borderColor={selected ? 'brand.500' : 'white'} borderRadius="14px" boxShadow={selected ? '0 7px 0 #1A5D98' : '0 5px 0 #CBD5E0'} onClick={() => setSelectedCategory(category)} display="flex" flexDirection="column" justifyContent="center" gap="2px" _active={{ transform: 'translateY(3px)', boxShadow: '0 2px 0 #1A5D98' }}><Text fontSize="22px">{categoryEmoji[index]}</Text><Text fontSize="11px" fontWeight="800" noOfLines={2}>{category}</Text><Badge fontSize="9px" colorScheme={selected ? 'whiteAlpha' : 'brand'}>{total} negocios</Badge></Button>;
            })}
          </SimpleGrid>
        </Box>
      </Box>

      <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', md: 'row' }}><Stack spacing="0"><Heading fontSize={{ base: 'xl', md: '2xl' }}>{selectedCategory || 'Todos los negocios'}</Heading><Text color={muted} fontSize="sm">Guardá favoritos y abrí las burbujas para contactar cada comercio.</Text></Stack><InputGroup maxW="320px"><InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un negocio" bg={panelBg} /></InputGroup></Flex>
      {shownBusinesses.length ? <Box display="grid" gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }} gap="16px">
        {shownBusinesses.map((business) => {
          const isFavorite = favoriteIds.includes(business.id);
          const contactLinks = (business.links || []).filter(Boolean).slice(0, 4);
          const contactsOpen = openContactId === business.id;
          return <Box key={business.id} p="16px" minW="0" minH={{ base: '250px', sm: '220px' }} borderRadius="22px" bg={panelBg} border="1px solid" borderColor="gray.100" boxShadow="md" position="relative" overflow="visible" transition="all .2s ease" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'brand.300' }}>
            <Flex direction={{ base: 'column', sm: 'row' }} gap="14px" align={{ base: 'center', sm: 'center' }} textAlign={{ base: 'center', sm: 'left' }}><IconButton aria-label={contactsOpen ? `Ocultar contactos de ${business.name}` : `Ver contactos de ${business.name}`} aria-expanded={contactsOpen} onClick={() => contactLinks.length && setOpenContactId((current) => current === business.id ? '' : business.id)} w="76px" h="76px" minW="76px" borderRadius="20px" overflow="hidden" bg="brand.50" cursor={contactLinks.length ? 'pointer' : 'default'} icon={business.logoUrl ? <Image src={business.logoUrl} alt={business.name} w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="34px" h="34px" color="brand.500" />} _hover={contactLinks.length ? { transform: 'scale(1.04)', boxShadow: '0 0 0 4px', boxShadowColor: 'brand.200' } : undefined} /><Stack spacing="3px" minW="0" flex="1" align={{ base: 'center', sm: 'flex-start' }} w="100%"><Badge w="fit-content" colorScheme="brand">{business.category}</Badge><Text fontWeight="900" fontSize="lg" noOfLines={1} maxW="100%">{business.name}</Text><Text color={muted} fontSize="sm" noOfLines={2} maxW="100%">{business.description || 'Negocio local disponible en el centro comercial.'}</Text>{contactLinks.length > 0 && <Text color="brand.500" fontSize="xs" fontWeight="800">{contactsOpen ? 'Elegí una burbuja para contactar' : 'Tocá el logo para contactar'}</Text>}</Stack><IconButton position={{ base: 'absolute', sm: 'static' }} top="10px" right="10px" aria-label={isFavorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={isFavorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={isFavorite ? 'red.400' : muted} onClick={() => toggleFavorite(business.id)} /></Flex>
            {contactsOpen && <Box position="absolute" zIndex={5} left="12px" right="12px" bottom="12px" p="14px" borderRadius="18px" bg={panelBg} border="1px solid" borderColor="brand.200" boxShadow="0 18px 38px rgba(15, 23, 42, .25)"><Text color={muted} fontSize="xs" fontWeight="900" textAlign="center" mb="10px">ELEGÍ UN CONTACTO</Text><SimpleGrid columns={Math.min(contactLinks.length, 4)} spacing="10px">{contactLinks.map((businessLink) => { const meta = linkMeta(businessLink); return <Tooltip key={businessLink} label={`Abrir ${meta.label}`} hasArrow><Stack as="a" href={hrefFor(businessLink)} target="_blank" rel="noopener noreferrer" align="center" spacing="4px" minW="0" color="inherit" _hover={{ textDecoration: 'none', transform: 'translateY(-4px)' }} transition="transform .18s ease"><IconButton aria-label={`Abrir ${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} w="22px" h="22px" />} bg={meta.bg} color="white" borderRadius="full" w="54px" h="54px" minW="54px" boxShadow="0 10px 18px rgba(15, 23, 42, .22)" pointerEvents="none" /><Text fontSize="10px" fontWeight="800" noOfLines={1}>{meta.label}</Text></Stack></Tooltip>; })}</SimpleGrid></Box>}
          </Box>;
        })}
      </Box> : <Box textAlign="center" border="2px dashed" borderColor="brand.200" borderRadius="24px" p={{ base: '34px', md: '52px' }} bg={panelBg}><Text fontSize="44px">🏪</Text><Heading fontSize="xl" mt="8px">Esta zona está por desbloquearse</Heading><Text color={muted} mt="4px">Pronto habrá negocios para explorar aquí.</Text></Box>}
    </PublicPage>
  );
}
