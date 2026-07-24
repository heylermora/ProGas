// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import {
  MdEmail,
  MdFavorite,
  MdFavoriteBorder,
  MdLink,
  MdMyLocation,
  MdSearch,
  MdStorefront,
} from 'react-icons/md';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];
const categoryShortLabels = ['Restaurantes', 'Rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías', 'Licoreras', 'Súperes', 'Tiendas', 'Joyerías', 'Zapaterías', 'Barberías', 'Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agro', 'Gimnasios', 'Motos', 'Mecánicos', 'Fumigadoras', 'Otros'];
const mapPositions = [
  [50, 8], [68, 12], [84, 24], [91, 43], [84, 62],
  [68, 78], [50, 88], [32, 78], [16, 62], [9, 43],
  [16, 24], [32, 12], [39, 30], [61, 30], [72, 44],
  [61, 58], [39, 58], [28, 44], [50, 22], [73, 70], [27, 70],
];

const playerPulse = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-9px) scale(1.08); }
`;
const playerShadow = keyframes`
  0%, 100% { transform: translateX(-50%) scale(.95); opacity: .34; }
  50% { transform: translateX(-50%) scale(.62); opacity: .17; }
`;
const floatIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [query, setQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [openContactId, setOpenContactId] = useState('');
  const panelBg = useColorModeValue('white', 'navy.800');
  const softPanelBg = useColorModeValue('white', 'whiteAlpha.100');
  const muted = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    SponsorService.getAll().then(setBusinesses).catch(() => setBusinesses([]));
  }, []);

  const activeBusinesses = useMemo(() => businesses.filter((business) => business.active !== false), [businesses]);
  const categoryBusinesses = useMemo(
    () => activeBusinesses.filter((business) => !selectedCategory || business.category === selectedCategory),
    [activeBusinesses, selectedCategory],
  );
  const shownBusinesses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return categoryBusinesses.filter((business) => !search || `${business.name || ''} ${business.description || ''} ${business.category || ''}`.toLowerCase().includes(search));
  }, [categoryBusinesses, query]);
  const selectedBusiness = shownBusinesses.find((business) => business.id === selectedBusinessId) || shownBusinesses[0];
  const activeMapIndex = Math.max(0, BUSINESS_CATEGORIES.indexOf(selectedCategory));
  const [playerLeft, selectedTop] = selectedCategory ? mapPositions[activeMapIndex] : [50, 51];
  const playerTop = selectedCategory ? Math.min(selectedTop + 8, 91) : selectedTop;
  const mapPath = [0, 1, 2, 3, 4, 19, 5, 6, 7, 20, 8, 9, 10, 11, 18, 12, 13, 14, 15, 16, 17]
    .map((index) => mapPositions[index].join(','))
    .join(' ');

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedBusinessId('');
    setOpenContactId('');
  };
  const toggleFavorite = (businessId) => setFavoriteIds((current) => current.includes(businessId) ? current.filter((id) => id !== businessId) : [...current, businessId]);

  return (
    <PublicPage maxW="1280px">
      <Stack spacing={{ base: '18px', md: '22px' }}>
        <Box borderRadius={{ base: '24px', md: '34px' }} overflow="hidden" p={{ base: '22px', md: '34px' }} bgGradient="linear(135deg, #111827 0%, #312E81 46%, #0EA5E9 100%)" color="white" position="relative">
          <Box position="absolute" right={{ base: '-42px', md: '-24px' }} top={{ base: '-52px', md: '-68px' }} fontSize={{ base: '150px', md: '210px' }} opacity=".13">🕹️</Box>
          <Stack spacing="10px" maxW="720px" position="relative">
            <Badge w="fit-content" px="10px" py="4px" borderRadius="full" bg="cyan.300" color="navy.800" letterSpacing=".08em">MODO EXPLORACIÓN</Badge>
            <Heading fontSize={{ base: '31px', md: '52px' }} lineHeight="1.02">Centro Comercial Virtual</Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.900">Elegí una estación del mapa, mové el astronauta y descubrí negocios locales como si desbloquearas zonas de un juego.</Text>
            <Flex wrap="wrap" gap="10px" pt="4px">
              <Badge borderRadius="full" px="12px" py="6px" bg="whiteAlpha.200" color="white">{activeBusinesses.length} negocios</Badge>
              <Badge borderRadius="full" px="12px" py="6px" bg="whiteAlpha.200" color="white">{favoriteIds.length} favoritos</Badge>
              <Badge borderRadius="full" px="12px" py="6px" bg="whiteAlpha.200" color="white">{BUSINESS_CATEGORIES.length} estaciones</Badge>
            </Flex>
          </Stack>
        </Box>

        <Box bg={panelBg} borderRadius={{ base: '22px', md: '30px' }} p={{ base: '12px', md: '22px' }} boxShadow="xl" overflow="hidden">
          <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="12px" mb="14px" direction={{ base: 'column', md: 'row' }}>
            <Stack spacing="2px">
              <Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa galáctico</Heading>
              <Text color={muted} fontSize="sm">El mapa es la navegación principal: tocá estaciones para viajar y tocá la plaza central para ver todo.</Text>
            </Stack>
            <InputGroup w={{ base: '100%', md: '320px' }}>
              <InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar negocio" bg={softPanelBg} borderRadius="full" />
            </InputGroup>
          </Flex>

          <Box display="grid" gridTemplateColumns={{ base: '1fr', xl: 'minmax(0, 1.7fr) minmax(300px, .3fr)' }} gap="16px" alignItems="stretch">
            <Box position="relative" minH={{ base: '560px', md: '640px', xl: '680px' }} borderRadius="26px" overflow="hidden" bg="radial-gradient(circle at 50% 50%, #4338CA 0%, #1E1B4B 37%, #070B1F 78%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .78, bgImage: 'radial-gradient(circle at 12% 20%, #ffffff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #ffffff 0 1px, transparent 2px), radial-gradient(circle at 42% 88%, #ffffff 0 1.5px, transparent 2.5px)', bgSize: '42px 42px, 58px 58px, 73px 73px' }}>
              <Box as="svg" viewBox="0 0 100 100" preserveAspectRatio="none" position="absolute" inset="4%" w="92%" h="92%" opacity=".72" pointerEvents="none"><polyline points={mapPath} fill="none" stroke="#67E8F9" strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.4 1.3" /></Box>
              <Box position="absolute" left="7%" right="7%" top="47%" h={{ base: '26px', md: '44px' }} bg="cyan.300" opacity=".14" borderY={{ base: '4px solid', md: '8px solid' }} borderColor="cyan.100" transform="rotate(-4deg)" />
              <Box position="absolute" top="9%" bottom="9%" left="48%" w={{ base: '26px', md: '44px' }} bg="cyan.300" opacity=".14" borderX={{ base: '4px solid', md: '8px solid' }} borderColor="cyan.100" transform="rotate(5deg)" />

              <Box as="button" type="button" aria-label="Ver todas las zonas" onClick={() => selectCategory('')} position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" w={{ base: '104px', md: '140px' }} h={{ base: '104px', md: '140px' }} borderRadius="full" bg="rgba(250, 204, 21, .82)" border={{ base: '5px solid', md: '9px solid' }} borderColor="yellow.200" boxShadow="0 0 34px rgba(250, 204, 21, .55), inset 0 0 0 8px rgba(255,255,255,.22)" display="flex" alignItems="center" justifyContent="center" cursor="pointer" zIndex={1} _hover={{ filter: 'brightness(1.08)' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '4px' }}>
                <Stack align="center" spacing="0"><Text fontSize={{ base: '28px', md: '42px' }}>🪐</Text><Text fontSize={{ base: '10px', md: 'sm' }} fontWeight="900" color="navy.800">PLAZA CENTRAL</Text></Stack>
              </Box>

              {BUSINESS_CATEGORIES.map((category, index) => {
                const selected = selectedCategory === category;
                const total = activeBusinesses.filter((business) => business.category === category).length;
                const [left, top] = mapPositions[index];
                return (
                  <Button key={category} aria-label={`Ir a ${category}, ${total} negocios`} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '46px', sm: '58px', md: '88px' }} h={{ base: '46px', sm: '58px', md: '72px' }} minW={{ base: '46px', sm: '58px', md: '88px' }} minH={{ base: '46px', sm: '58px', md: '72px' }} p={{ base: 0, md: '7px' }} variant="unstyled" bg={selected ? 'brand.500' : 'whiteAlpha.900'} color={selected ? 'white' : 'navy.700'} border="3px solid" borderColor={selected ? 'cyan.200' : 'white'} borderRadius={{ base: 'full', md: '20px' }} boxShadow={selected ? '0 0 0 5px rgba(103, 232, 249, .24), 0 0 24px rgba(103, 232, 249, .9)' : '0 0 13px rgba(255,255,255,.55)'} onClick={() => selectCategory(category)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="2px" transition="all .25s cubic-bezier(.2,.8,.2,1)" zIndex={2} _hover={{ transform: 'translate(-50%, -50%) scale(1.08)', boxShadow: '0 0 0 6px rgba(103, 232, 249, .28), 0 0 28px rgba(103, 232, 249, .95)' }}>
                    <Text fontSize={{ base: '21px', sm: '24px', md: '27px' }}>{categoryEmoji[index]}</Text>
                    <Text display={{ base: 'none', md: 'block' }} maxW="100%" noOfLines={1} fontSize="10px" fontWeight="900">{categoryShortLabels[index]}</Text>
                    {total > 0 && <Badge display={{ base: 'none', md: 'inline-flex' }} fontSize="8px" borderRadius="full" colorScheme={selected ? 'whiteAlpha' : 'purple'}>{total}</Badge>}
                    {total > 0 && <Box position="absolute" top="4px" right="4px" w={{ base: '9px', md: '10px' }} h={{ base: '9px', md: '10px' }} borderRadius="full" bg="green.400" boxShadow="0 0 0 3px rgba(255,255,255,.78)" />}
                  </Button>
                );
              })}

              {selectedCategory && shownBusinesses.length > 0 && (
                <Box position="absolute" left={{ base: '10px', md: '16px' }} right={{ base: '10px', md: '16px' }} bottom={{ base: '10px', md: '16px' }} zIndex={3} p={{ base: '8px', md: '10px' }} borderRadius="20px" bg="rgba(8, 13, 35, .72)" border="1px solid" borderColor="whiteAlpha.300" boxShadow="0 16px 34px rgba(0,0,0,.26)" backdropFilter="blur(10px)">
                  <Flex align="center" justify="space-between" gap="8px" mb="8px">
                    <Text fontSize="10px" color="cyan.200" fontWeight="900" letterSpacing=".1em">NEGOCIOS CERCA</Text>
                    <Badge borderRadius="full" colorScheme="cyan" fontSize="9px">{shownBusinesses.length}</Badge>
                  </Flex>
                  <Flex gap="8px" overflowX="auto" pb="2px" sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    {shownBusinesses.slice(0, 6).map((business) => {
                      const selected = selectedBusiness?.id === business.id;
                      return (
                        <Button key={business.id} aria-label={`Ver ${business.name}`} onClick={() => setSelectedBusinessId(business.id)} flex="0 0 auto" w={{ base: '116px', md: '132px' }} h="54px" variant="unstyled" borderRadius="16px" bg={selected ? 'white' : 'whiteAlpha.200'} color={selected ? 'navy.800' : 'white'} border="1px solid" borderColor={selected ? 'yellow.300' : 'whiteAlpha.300'} boxShadow={selected ? '0 0 0 3px rgba(250,204,21,.18)' : 'none'} display="flex" alignItems="center" justifyContent="flex-start" gap="8px" px="8px">
                          <Flex w="34px" h="34px" flex="0 0 auto" borderRadius="12px" bg={selected ? 'gray.50' : 'whiteAlpha.200'} align="center" justify="center" overflow="hidden">
                            {business.logoUrl ? <Image src={business.logoUrl} alt={business.name} maxW="30px" maxH="30px" objectFit="contain" /> : <Icon as={MdStorefront} w="19px" h="19px" color={selected ? 'brand.500' : 'white'} />}
                          </Flex>
                          <Text textAlign="left" noOfLines={2} fontSize="10px" fontWeight="900" lineHeight="1.05">{business.name}</Text>
                        </Button>
                      );
                    })}
                  </Flex>
                </Box>
              )}

              <Stack position="absolute" left={`${playerLeft}%`} top={`${playerTop}%`} transform="translate(-50%, -50%)" w={{ base: '86px', md: '116px' }} align="center" spacing="0" zIndex={4} transition="left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)" pointerEvents="none">
                <Badge whiteSpace="nowrap" colorScheme="red" borderRadius="full" boxShadow="sm" fontSize={{ base: '9px', md: 'xs' }} mb="-2px"><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge>
                <Box position="relative" w={{ base: '52px', md: '66px' }} h={{ base: '44px', md: '58px' }} display="flex" justifyContent="center">
                  <Box position="absolute" bottom="1px" left="50%" w={{ base: '30px', md: '40px' }} h={{ base: '8px', md: '11px' }} borderRadius="full" bg="blackAlpha.400" animation={`${playerShadow} 1s ease-in-out infinite`} />
                  <Box position="relative" zIndex={1} animation={`${playerPulse} 1s ease-in-out infinite`} fontSize={{ base: '34px', md: '46px' }} lineHeight="1">🧑‍🚀</Box>
                </Box>
              </Stack>
            </Box>

            <Stack minW="0" spacing="12px">
              <Box borderRadius="22px" bg="navy.800" color="white" p={{ base: '14px', md: '16px' }} boxShadow="lg">
                <Text fontSize="10px" letterSpacing=".12em" color="cyan.200" fontWeight="900">DESTINO ACTUAL</Text>
                <Heading mt="2px" fontSize={{ base: 'xl', md: '2xl' }} noOfLines={2}>{selectedCategory || 'Plaza central'}</Heading>
                <Text mt="6px" fontSize="sm" color="whiteAlpha.850">{selectedCategory ? `${shownBusinesses.length} negocios para visitar en esta zona.` : 'Seleccioná una estación o buscá tu negocio favorito.'}</Text>
              </Box>

              {selectedBusiness && (
                <FeaturedBusiness
                  business={selectedBusiness}
                  muted={muted}
                  favorite={favoriteIds.includes(selectedBusiness.id)}
                  onFavorite={() => toggleFavorite(selectedBusiness.id)}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Box>
          <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" mb="14px" gap="12px" direction={{ base: 'column', md: 'row' }}>
            <Stack spacing="0">
              <Heading fontSize={{ base: 'xl', md: '2xl' }}>{selectedCategory || 'Todos los negocios'}</Heading>
              <Text color={muted} fontSize="sm">Cada negocio es el protagonista: abrí su card para ver contactos flotantes.</Text>
            </Stack>
          </Flex>
          {shownBusinesses.length ? (
            <Box display="grid" gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }} gap="16px">
              {shownBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  contactsOpen={openContactId === business.id}
                  favorite={favoriteIds.includes(business.id)}
                  muted={muted}
                  panelBg={panelBg}
                  onSelect={() => setSelectedBusinessId(business.id)}
                  onOpenContacts={() => setOpenContactId((current) => current === business.id ? '' : business.id)}
                  onFavorite={() => toggleFavorite(business.id)}
                />
              ))}
            </Box>
          ) : (
            <Box textAlign="center" border="2px dashed" borderColor="brand.200" borderRadius="24px" p={{ base: '34px', md: '52px' }} bg={panelBg}>
              <Text fontSize="44px">🏪</Text>
              <Heading fontSize="xl" mt="8px">Zona por desbloquearse</Heading>
              <Text color={muted} mt="4px">Pronto habrá negocios para explorar aquí.</Text>
            </Box>
          )}
        </Box>
      </Stack>
    </PublicPage>
  );
}

function FeaturedBusiness({ business, muted, favorite, onFavorite }) {
  return (
    <Box borderRadius="22px" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" p="14px" color="white">
      <Flex align="center" gap="12px" minW="0">
        <Flex w="58px" h="58px" flex="0 0 auto" borderRadius="18px" bg="white" align="center" justify="center" p="8px" overflow="hidden">
          {business.logoUrl ? <Image src={business.logoUrl} alt={business.name} maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="28px" h="28px" color="brand.500" />}
        </Flex>
        <Stack spacing="3px" minW="0" flex="1">
          <Text fontSize="10px" color="cyan.200" fontWeight="900" letterSpacing=".1em">NEGOCIO DESTACADO</Text>
          {business.name && <Heading fontSize="lg" noOfLines={2}>{business.name}</Heading>}
          {business.description && <Text fontSize="xs" color="whiteAlpha.800" noOfLines={2}>{business.description}</Text>}
        </Stack>
        <IconButton aria-label={favorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={favorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={favorite ? 'red.300' : 'whiteAlpha.800'} onClick={onFavorite} />
      </Flex>
    </Box>
  );
}

function BusinessCard({ business, contactsOpen, favorite, muted, panelBg, onSelect, onOpenContacts, onFavorite }) {
  const contactLinks = (business.links || []).filter(Boolean).slice(0, 4);
  const hasContacts = contactLinks.length > 0;

  return (
    <Box onClick={onSelect} p={{ base: '14px', md: '16px' }} minW="0" minH="194px" borderRadius="24px" bg={panelBg} border="1px solid" borderColor="gray.100" boxShadow="md" position="relative" overflow="visible" transition="all .2s ease" _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', borderColor: 'brand.300' }}>
      <Flex gap="14px" align="center" minW="0">
        <Box w={{ base: '82px', md: '92px' }} h={{ base: '82px', md: '92px' }} flex="0 0 auto" borderRadius="24px" bg="linear-gradient(135deg, #F8FAFC, #EEF2FF)" border="1px solid" borderColor="gray.100" display="flex" alignItems="center" justifyContent="center" p="10px" boxShadow="inset 0 0 0 1px rgba(255,255,255,.8)">
          {business.logoUrl ? <Image src={business.logoUrl} alt={business.name} maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} w="40px" h="40px" color="brand.500" />}
        </Box>
        <Stack spacing="5px" minW="0" flex="1">
          {business.category && <Badge w="fit-content" maxW="100%" noOfLines={1} colorScheme="purple" borderRadius="full">{business.category}</Badge>}
          {business.name && <Heading fontSize={{ base: 'lg', md: 'xl' }} noOfLines={2} lineHeight="1.12">{business.name}</Heading>}
          {business.description && <Text color={muted} fontSize="sm" noOfLines={2}>{business.description}</Text>}
        </Stack>
        <IconButton aria-label={favorite ? `Quitar ${business.name} de favoritos` : `Guardar ${business.name} en favoritos`} icon={<Icon as={favorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={favorite ? 'red.400' : muted} onClick={(event) => { event.stopPropagation(); onFavorite(); }} />
      </Flex>

      <Flex mt="14px" align="center" justify="space-between" gap="10px" wrap="wrap">
        {hasContacts && <Text color="brand.500" fontSize="sm" fontWeight="900">{contactsOpen ? 'Contactos disponibles' : 'Tocá contactar'}</Text>}
        {hasContacts && <Button size="sm" borderRadius="full" colorScheme="brand" onClick={(event) => { event.stopPropagation(); onOpenContacts(); }}>{contactsOpen ? 'Cerrar' : 'Contactar'}</Button>}
      </Flex>

      {contactsOpen && (
        <Box position="absolute" zIndex={8} left="auto" right={{ base: '10px', md: '14px' }} bottom="52px" p="10px" maxW={{ base: 'calc(100% - 20px)', md: '252px' }} borderRadius="22px" bg={panelBg} border="1px solid" borderColor="brand.200" boxShadow="0 18px 40px rgba(15, 23, 42, .28)" animation={`${floatIn} .18s ease-out`}>
          <SimpleGrid columns={Math.min(contactLinks.length, 4)} spacing="7px">
            {contactLinks.map((businessLink) => {
              const meta = linkMeta(businessLink);
              return (
                <Stack key={businessLink} as="a" href={hrefFor(businessLink)} target="_blank" rel="noopener noreferrer" align="center" spacing="4px" minW="0" color="inherit" onClick={(event) => event.stopPropagation()} _hover={{ textDecoration: 'none', transform: 'translateY(-3px)' }} transition="transform .18s ease">
                  <Flex align="center" justify="center" w={{ base: '42px', md: '48px' }} h={{ base: '42px', md: '48px' }} borderRadius="full" bg={meta.bg} color="white" boxShadow="0 10px 18px rgba(15, 23, 42, .22)"><Icon as={meta.icon} w={{ base: '18px', md: '20px' }} h={{ base: '18px', md: '20px' }} /></Flex>
                  <Text fontSize="10px" fontWeight="900" noOfLines={1}>{meta.label}</Text>
                </Stack>
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}
