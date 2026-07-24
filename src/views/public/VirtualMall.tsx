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
const mapPositions = [
  [7, 12], [26, 10], [48, 12], [70, 10], [84, 17], [8, 39], [27, 36],
  [48, 39], [69, 35], [84, 43], [8, 67], [26, 65], [47, 70], [67, 64],
  [83, 70], [18, 84], [38, 86], [58, 84], [76, 86], [8, 89], [88, 90],
];
const playerPulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-10px) scale(1.08); }
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
  const [playerLeft, playerTop] = selectedCategory ? mapPositions[activeMapIndex] : [50, 51];

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
        <Flex align="center" justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', sm: 'row' }}><Box><Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa del centro comercial</Heading><Text color={muted} fontSize="sm">Mové a tu personaje tocando una zona. En móvil usá el minimapa para navegar sin desbordes.</Text></Box><Button size="sm" variant={selectedCategory ? 'outline' : 'solid'} colorScheme="brand" onClick={() => setSelectedCategory('')}>Volver a la plaza</Button></Flex>
        <Box display={{ base: 'none', md: 'block' }}>
          <Box position="relative" w="100%" h={{ md: '590px', lg: '620px' }} borderRadius="24px" overflow="hidden" bg="linear-gradient(135deg, #B7E4C7 0%, #95D5B2 42%, #90DBF4 100%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .42, bgImage: 'radial-gradient(circle at 20% 20%, #ffffff 0 2px, transparent 3px), radial-gradient(circle at 70% 35%, #ffffff 0 2px, transparent 3px)', bgSize: '46px 46px, 58px 58px' }}>
            <Box position="absolute" left="5%" right="5%" top="45%" h="58px" bg="whiteAlpha.900" borderY="8px solid" borderColor="gray.300" transform="rotate(-4deg)" />
            <Box position="absolute" top="7%" bottom="7%" left="47%" w="58px" bg="whiteAlpha.900" borderX="8px solid" borderColor="gray.300" transform="rotate(5deg)" />
            <Box position="absolute" left="39%" top="39%" w="22%" h="22%" borderRadius="full" bg="yellow.100" border="8px solid" borderColor="yellow.300" boxShadow="inset 0 0 0 8px rgba(255,255,255,.6)" display="flex" alignItems="center" justifyContent="center"><Stack align="center" spacing="0"><Text fontSize="32px">⛲</Text><Text fontSize="xs" fontWeight="900" color="yellow.800">PLAZA CENTRAL</Text></Stack></Box>
            {BUSINESS_CATEGORIES.map((category, index) => {
              const selected = selectedCategory === category;
              const total = activeBusinesses.filter((business) => business.category === category).length;
              const [left, top] = mapPositions[index];
              return <Button key={category} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '124px', md: '138px' }} minH={{ base: '88px', md: '96px' }} whiteSpace="normal" py="8px" px="7px" variant="unstyled" bg={selected ? 'brand.500' : 'white'} color={selected ? 'white' : 'navy.700'} border="3px solid" borderColor={selected ? 'brand.500' : 'white'} borderRadius="18px" boxShadow={selected ? '0 15px 0 #1A5D98, 0 22px 30px rgba(15, 23, 42, .28)' : '0 8px 0 #CBD5E0, 0 13px 22px rgba(15, 23, 42, .20)'} onClick={() => setSelectedCategory(category)} display="flex" flexDirection="column" justifyContent="center" gap="2px" transition="all .35s cubic-bezier(.2,.8,.2,1)" zIndex={2} _hover={{ transform: 'translate(-50%, calc(-50% - 6px)) scale(1.04)', boxShadow: selected ? '0 19px 0 #1A5D98, 0 25px 32px rgba(15, 23, 42, .3)' : '0 13px 0 #CBD5E0, 0 18px 28px rgba(15, 23, 42, .24)' }}><Text fontSize="26px">{categoryEmoji[index]}</Text><Text fontSize="xs" fontWeight="900" noOfLines={2}>{category}</Text><Badge fontSize="9px" colorScheme={selected ? 'whiteAlpha' : 'brand'}>{total} negocios</Badge>{total > 0 && <Box position="absolute" top="7px" right="7px" w="9px" h="9px" borderRadius="full" bg="green.400" boxShadow="0 0 0 3px rgba(255,255,255,.72)" />}</Button>;
            })}
            <Box position="absolute" left={`${playerLeft}%`} top={`${playerTop}%`} zIndex={4} transition="left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)" pointerEvents="none"><Badge position="absolute" left="50%" top="-28px" transform="translateX(-50%)" whiteSpace="nowrap" colorScheme="red" borderRadius="full" boxShadow="sm"><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge><Box position="absolute" top="24px" left="50%" w="36px" h="10px" borderRadius="full" bg="blackAlpha.400" animation={`${playerShadow} 1s ease-in-out infinite`} /><Box animation={`${playerPulse} 1s ease-in-out infinite`} fontSize="42px" lineHeight="1">🧑‍🚀</Box></Box>
            <Box position="absolute" right="4%" bottom="4%" px="12px" py="7px" borderRadius="full" bg="gray.800" color="white" fontSize="xs" fontWeight="800">🚪 SALIDA DEL MAPA</Box>
          </Box>
        </Box>
        <Box display={{ base: 'block', md: 'none' }} p="10px" borderRadius="18px" bg="linear-gradient(135deg, #B7E4C7, #90DBF4)">
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
          return <Box key={business.id} p="16px" borderRadius="22px" bg={panelBg} border="1px solid" borderColor="gray.100" boxShadow="md" transition="all .2s ease" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'brand.300' }}>
            <Flex gap="14px" align="center"><IconButton aria-label={contactsOpen ? `Ocultar contactos de ${business.name}` : `Ver contactos de ${business.name}`} aria-expanded={contactsOpen} onClick={() => contactLinks.length && setOpenContactId((current) => current === business.id ? '' : business.id)} w="76px" h="76px" minW="76px" borderRadius="20px" overflow="hidden" bg="brand.50" cursor={contactLinks.length ? 'pointer' : 'default'} icon={business.logoUrl ? <Image src={business.logoUrl} alt={business.name} w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="34px" h="34px" color="brand.500" />} _hover={contactLinks.length ? { transform: 'scale(1.04)', boxShadow: '0 0 0 4px', boxShadowColor: 'brand.200' } : undefined} /><Stack spacing="3px" minW="0" flex="1"><Badge w="fit-content" colorScheme="brand">{business.category}</Badge><Text fontWeight="900" fontSize="lg" noOfLines={1}>{business.name}</Text><Text color={muted} fontSize="sm" noOfLines={2}>{business.description || 'Negocio local disponible en el centro comercial.'}</Text>{contactLinks.length > 0 && <Text color="brand.500" fontSize="xs" fontWeight="800">{contactsOpen ? 'Contactos disponibles' : 'Tocá el logo para contactar'}</Text>}</Stack><IconButton aria-label={isFavorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={isFavorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={isFavorite ? 'red.400' : muted} onClick={() => toggleFavorite(business.id)} /></Flex>
            {contactsOpen && <Flex mt="16px" pt="14px" borderTop="1px solid" borderColor="brand.100" gap={{ base: '12px', sm: '16px' }} flexWrap="wrap" align="center"><Text color={muted} fontSize="xs" fontWeight="900" w={{ base: '100%', sm: 'auto' }}>ELEGÍ UN CONTACTO</Text>{contactLinks.map((businessLink) => { const meta = linkMeta(businessLink); return <Tooltip key={businessLink} label={`Abrir ${meta.label}`} hasArrow><Stack as="a" href={hrefFor(businessLink)} target="_blank" rel="noopener noreferrer" align="center" spacing="4px" minW="58px" color="inherit" _hover={{ textDecoration: 'none', transform: 'translateY(-4px)' }} transition="transform .18s ease"><IconButton aria-label={`Abrir ${meta.label} de ${business.name}`} icon={<Icon as={meta.icon} w="22px" h="22px" />} bg={meta.bg} color="white" borderRadius="full" w="54px" h="54px" minW="54px" boxShadow="0 10px 18px rgba(15, 23, 42, .22)" pointerEvents="none" /><Text fontSize="10px" fontWeight="800" noOfLines={1}>{meta.label}</Text></Stack></Tooltip>; })}</Flex>}
          </Box>;
        })}
      </Box> : <Box textAlign="center" border="2px dashed" borderColor="brand.200" borderRadius="24px" p={{ base: '34px', md: '52px' }} bg={panelBg}><Text fontSize="44px">🏪</Text><Heading fontSize="xl" mt="8px">Esta zona está por desbloquearse</Heading><Text color={muted} mt="4px">Pronto habrá negocios para explorar aquí.</Text></Box>}
    </PublicPage>
  );
}
