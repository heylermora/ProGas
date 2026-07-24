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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import {
  MdArrowBack,
  MdClose,
  MdEmail,
  MdFavorite,
  MdFavoriteBorder,
  MdLink,
  MdMyLocation,
  MdPlayArrow,
  MdSearch,
  MdStorefront,
} from 'react-icons/md';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];
const shortLabels = ['Restaurantes', 'Rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías', 'Licoreras', 'Súperes', 'Tiendas', 'Joyerías', 'Zapaterías', 'Barberías', 'Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agro', 'Gimnasios', 'Motos', 'Mecánicos', 'Fumigadoras', 'Otros'];
const categoryPositions = [
  [50, 9], [68, 13], [84, 25], [91, 43], [85, 62], [70, 79], [50, 89],
  [30, 79], [15, 62], [9, 43], [16, 25], [32, 13], [39, 29], [61, 29],
  [73, 44], [62, 60], [38, 60], [27, 44], [50, 21], [76, 70], [24, 70],
];

const astronautFloat = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.06); }
`;
const shadowPulse = keyframes`
  0%, 100% { transform: translateX(-50%) scale(.95); opacity: .38; }
  50% { transform: translateX(-50%) scale(.62); opacity: .16; }
`;
const panelArrival = keyframes`
  from { opacity: 0; transform: translateY(18px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const bubbleArrival = keyframes`
  from { opacity: 0; transform: translateX(12px) scale(.72); }
  to { opacity: 1; transform: translateX(0) scale(1); }
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
const videoSource = (value = '') => value.match(/src=["']([^"']+)["']/i)?.[1] || value;
const businessPosition = (index, total) => {
  const ring = index < 8 ? 0 : 1;
  const ringIndex = ring ? index - 8 : index;
  const ringTotal = ring ? Math.max(1, total - 8) : Math.min(total, 8);
  const angle = (ringIndex / ringTotal) * Math.PI * 2 - Math.PI / 2;
  const radiusX = ring ? 26 : 39;
  const radiusY = ring ? 24 : 36;
  return [50 + Math.cos(angle) * radiusX, 49 + Math.sin(angle) * radiusY];
};

export default function VirtualMall() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [query, setQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const panelBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    SponsorService.getAll().then(setBusinesses).catch(() => setBusinesses([]));
  }, []);

  const activeBusinesses = useMemo(() => businesses.filter((business) => business.active !== false), [businesses]);
  const categoryBusinesses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return activeBusinesses
      .filter((business) => business.category === selectedCategory)
      .filter((business) => !search || `${business.name || ''} ${business.description || ''}`.toLowerCase().includes(search));
  }, [activeBusinesses, query, selectedCategory]);
  const selectedBusiness = categoryBusinesses.find((business) => business.id === selectedBusinessId);
  const selectedCategoryIndex = BUSINESS_CATEGORIES.indexOf(selectedCategory);
  const categoryIcon = categoryEmoji[selectedCategoryIndex] || '🪐';
  const contactLinks = (selectedBusiness?.links || []).filter(Boolean).slice(0, 4);

  const enterCategory = (category) => {
    setSelectedCategory(category);
    setSelectedBusinessId('');
    setContactsOpen(false);
    setQuery('');
  };
  const returnToGalaxy = () => {
    setSelectedCategory('');
    setSelectedBusinessId('');
    setContactsOpen(false);
    setQuery('');
  };
  const selectBusiness = (id) => {
    setSelectedBusinessId(id);
    setContactsOpen(false);
  };
  const toggleFavorite = (id) => setFavoriteIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <PublicPage maxW="1280px">
      <Stack spacing={{ base: '16px', md: '22px' }}>
        <Box borderRadius={{ base: '24px', md: '34px' }} overflow="hidden" p={{ base: '20px', md: '30px' }} bgGradient="linear(135deg, #111827 0%, #312E81 48%, #0284C7 100%)" color="white" position="relative">
          <Box position="absolute" right="-25px" top="-60px" fontSize={{ base: '140px', md: '190px' }} opacity=".11">🕹️</Box>
          <Stack spacing="8px" maxW="760px" position="relative">
            <Badge w="fit-content" px="10px" py="4px" borderRadius="full" bg="cyan.300" color="navy.800" letterSpacing=".08em">MODO EXPLORACIÓN</Badge>
            <Heading fontSize={{ base: '29px', md: '48px' }} lineHeight="1.04">Centro Comercial Virtual</Heading>
            <Text fontSize={{ base: 'sm', md: 'lg' }} color="whiteAlpha.900">Viajá por el mapa, entrá a una categoría y descubrí cada negocio en su propia estación.</Text>
          </Stack>
        </Box>

        <Box bg={panelBg} borderRadius={{ base: '22px', md: '30px' }} p={{ base: '8px', md: '16px' }} boxShadow="xl" overflow="hidden">
          <Flex px={{ base: '6px', md: '8px' }} pb="12px" align={{ base: 'stretch', md: 'center' }} justify="space-between" gap="10px" direction={{ base: 'column', md: 'row' }}>
            <Stack spacing="1px">
              <Flex align="center" gap="8px">
                {selectedCategory && <IconButton aria-label="Volver al mapa de categorías" icon={<MdArrowBack />} size="sm" borderRadius="full" onClick={returnToGalaxy} />}
                <Heading fontSize={{ base: 'lg', md: 'xl' }}>{selectedCategory ? `${categoryIcon} ${selectedCategory}` : 'Mapa galáctico'}</Heading>
              </Flex>
              <Text pl={selectedCategory ? '40px' : 0} color={muted} fontSize="xs">{selectedCategory ? 'Elegí una estación para conocer el negocio.' : 'Elegí una categoría para viajar a su submapa.'}</Text>
            </Stack>
            {selectedCategory && (
              <InputGroup w={{ base: '100%', md: '280px' }} size="sm">
                <InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en esta zona" borderRadius="full" />
              </InputGroup>
            )}
          </Flex>

          <Box position="relative" minH={{ base: '620px', md: '690px' }} borderRadius={{ base: '18px', md: '26px' }} overflow="hidden" bg="radial-gradient(circle at 50% 46%, #4338CA 0%, #1E1B4B 38%, #070B1F 78%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .75, bgImage: 'radial-gradient(circle at 12% 20%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #fff 0 1px, transparent 2px), radial-gradient(circle at 42% 88%, #fff 0 1.5px, transparent 2.5px)', bgSize: '42px 42px, 58px 58px, 73px 73px' }}>
            <Box position="absolute" inset="8%" border="1px dashed" borderColor="cyan.200" borderRadius="45%" opacity=".24" />
            <Box position="absolute" inset="21%" border="1px dashed" borderColor="purple.200" borderRadius="44%" opacity=".2" />

            {!selectedCategory ? (
              <CategoryMap businesses={activeBusinesses} onSelect={enterCategory} />
            ) : (
              <BusinessMap businesses={categoryBusinesses} categoryIcon={categoryIcon} selectedId={selectedBusinessId} onSelect={selectBusiness} />
            )}

            <Astronaut selectedCategory={selectedCategory} selectedCategoryIndex={selectedCategoryIndex} selectedBusiness={selectedBusiness} businesses={categoryBusinesses} />

            {selectedCategory && categoryBusinesses.length === 0 && (
              <Stack position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" align="center" textAlign="center" color="white" zIndex={3} w="80%">
                <Text fontSize="52px">🛰️</Text>
                <Heading fontSize="xl">No hay estaciones disponibles</Heading>
                <Text color="whiteAlpha.700" fontSize="sm">Probá otra búsqueda o regresá al mapa galáctico.</Text>
              </Stack>
            )}

            {selectedBusiness && (
              <BusinessDossier
                business={selectedBusiness}
                favorite={favoriteIds.includes(selectedBusiness.id)}
                contactsOpen={contactsOpen}
                contactLinks={contactLinks}
                onClose={() => { setSelectedBusinessId(''); setContactsOpen(false); }}
                onFavorite={() => toggleFavorite(selectedBusiness.id)}
                onContacts={() => setContactsOpen((open) => !open)}
                onVideo={() => setVideoOpen(true)}
              />
            )}
          </Box>
        </Box>
      </Stack>

      <Modal isOpen={videoOpen} onClose={() => setVideoOpen(false)} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
        <ModalContent bg="navy.900" color="white" borderRadius="24px" overflow="hidden" mx="12px">
          <ModalHeader>{selectedBusiness?.name || 'Video del negocio'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: '12px', md: '20px' }}>
            {selectedBusiness?.videoUrl?.startsWith('data:video') ? (
              <Box as="video" src={selectedBusiness.videoUrl} controls autoPlay w="100%" maxH="70vh" borderRadius="16px" />
            ) : (
              <Box as="iframe" title={`Video de ${selectedBusiness?.name || 'negocio'}`} src={videoSource(selectedBusiness?.videoUrl)} w="100%" h={{ base: '240px', md: '520px' }} border="0" borderRadius="16px" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PublicPage>
  );
}

function CategoryMap({ businesses, onSelect }) {
  return BUSINESS_CATEGORIES.map((category, index) => {
    const total = businesses.filter((business) => business.category === category).length;
    const [left, top] = categoryPositions[index];
    return (
      <Button key={category} aria-label={`Entrar a ${category}, ${total} negocios`} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '48px', sm: '62px', md: '94px' }} h={{ base: '48px', sm: '62px', md: '78px' }} minW={{ base: '48px', sm: '62px', md: '94px' }} p={{ base: 0, md: '7px' }} variant="unstyled" bg="whiteAlpha.900" color="navy.800" border="3px solid white" borderRadius={{ base: 'full', md: '20px' }} boxShadow="0 0 16px rgba(255,255,255,.45)" onClick={() => onSelect(category)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} transition="all .2s ease" _hover={{ transform: 'translate(-50%, -50%) scale(1.09)', boxShadow: '0 0 26px rgba(103,232,249,.9)' }}>
        <Text fontSize={{ base: '21px', md: '28px' }} lineHeight="1">{categoryEmoji[index]}</Text>
        <Text display={{ base: 'none', md: 'block' }} mt="3px" maxW="100%" noOfLines={1} fontSize="10px" fontWeight="900">{shortLabels[index]}</Text>
        {total > 0 && <Badge position={{ base: 'absolute', md: 'static' }} right="-3px" top="-4px" fontSize="8px" borderRadius="full" colorScheme="purple">{total}</Badge>}
      </Button>
    );
  });
}

function BusinessMap({ businesses, categoryIcon, selectedId, onSelect }) {
  return (
    <>
      <Flex position="absolute" left="50%" top="49%" transform="translate(-50%, -50%)" w={{ base: '86px', md: '118px' }} h={{ base: '86px', md: '118px' }} borderRadius="full" bg="yellow.300" border={{ base: '6px solid', md: '9px solid' }} borderColor="yellow.100" align="center" justify="center" direction="column" color="navy.800" boxShadow="0 0 35px rgba(250,204,21,.45)" zIndex={1}>
        <Text fontSize={{ base: '30px', md: '42px' }}>{categoryIcon}</Text>
        <Text fontSize="9px" fontWeight="900">PLAZA DE ZONA</Text>
      </Flex>
      {businesses.slice(0, 16).map((business, index) => {
        const [left, top] = businessPosition(index, Math.min(businesses.length, 16));
        const selected = business.id === selectedId;
        return (
          <Button key={business.id} aria-label={`Abrir ficha de ${business.name || 'negocio'}`} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '66px', sm: '82px', md: '116px' }} h={{ base: '66px', sm: '78px', md: '94px' }} minW={{ base: '66px', sm: '82px', md: '116px' }} p={{ base: '6px', md: '9px' }} variant="unstyled" bg={selected ? 'cyan.100' : 'white'} color="navy.800" border="3px solid" borderColor={selected ? 'cyan.300' : 'white'} borderRadius={{ base: '20px', md: '25px' }} boxShadow={selected ? '0 0 0 5px rgba(103,232,249,.25), 0 0 30px #67E8F9' : '0 10px 20px rgba(0,0,0,.25)'} onClick={() => onSelect(business.id)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} transition="all .22s ease" _hover={{ transform: 'translate(-50%, -50%) scale(1.07)' }}>
            <Flex w={{ base: '36px', md: '50px' }} h={{ base: '32px', md: '48px' }} align="center" justify="center">
              {business.logoUrl ? <Image src={business.logoUrl} alt="" maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize={{ base: '24px', md: '34px' }} color="brand.500" />}
            </Flex>
            {business.name && <Text display={{ base: 'none', sm: 'block' }} mt="3px" w="100%" noOfLines={1} fontSize={{ sm: '9px', md: '11px' }} fontWeight="900">{business.name}</Text>}
          </Button>
        );
      })}
    </>
  );
}

function Astronaut({ selectedCategory, selectedCategoryIndex, selectedBusiness, businesses }) {
  let position = selectedCategory ? [50, 49] : [50, 50];
  if (!selectedCategory) position = [50, 50];
  else if (selectedBusiness) position = businessPosition(Math.max(0, businesses.findIndex((item) => item.id === selectedBusiness.id)), Math.min(businesses.length, 16));
  else if (selectedCategoryIndex >= 0) position = [50, 60];
  return (
    <Stack position="absolute" left={`${position[0]}%`} top={`${Math.min(position[1] + 9, 91)}%`} transform="translate(-50%, -50%)" w={{ base: '80px', md: '106px' }} align="center" spacing="0" zIndex={4} transition="left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)" pointerEvents="none">
      <Badge whiteSpace="nowrap" colorScheme="red" borderRadius="full" fontSize={{ base: '8px', md: '10px' }}><Icon as={MdMyLocation} mr="3px" />ESTÁS AQUÍ</Badge>
      <Box position="relative" w="62px" h="52px" display="flex" justifyContent="center">
        <Box position="absolute" bottom="1px" left="50%" w="38px" h="10px" borderRadius="full" bg="blackAlpha.500" animation={`${shadowPulse} 1s ease-in-out infinite`} />
        <Box position="relative" zIndex={1} animation={`${astronautFloat} 1s ease-in-out infinite`} fontSize={{ base: '36px', md: '45px' }} lineHeight="1">🧑‍🚀</Box>
      </Box>
    </Stack>
  );
}

function BusinessDossier({ business, favorite, contactsOpen, contactLinks, onClose, onFavorite, onContacts, onVideo }) {
  return (
    <Box position="absolute" zIndex={8} right={{ base: '8px', md: '18px' }} bottom={{ base: '8px', md: '18px' }} w={{ base: 'calc(100% - 16px)', md: '370px' }} maxH={{ base: '290px', md: 'calc(100% - 36px)' }} overflowY="auto" p={{ base: '14px', md: '18px' }} borderRadius={{ base: '22px', md: '28px' }} bg="rgba(8, 14, 38, .94)" color="white" border="1px solid" borderColor="cyan.300" boxShadow="0 24px 65px rgba(0,0,0,.52), inset 0 0 28px rgba(34,211,238,.05)" backdropFilter="blur(16px)" animation={`${panelArrival} .24s ease-out`}>
      <Flex align="center" justify="space-between" mb="12px">
        <Badge bg="cyan.300" color="navy.900" borderRadius="full" px="9px">FICHA DE ESTACIÓN</Badge>
        <IconButton aria-label="Cerrar ficha" icon={<MdClose />} size="sm" variant="ghost" color="white" onClick={onClose} />
      </Flex>
      <Flex gap="14px" align="center">
        <Flex w={{ base: '66px', md: '84px' }} h={{ base: '66px', md: '84px' }} flex="0 0 auto" borderRadius="22px" bg="white" align="center" justify="center" p="9px">
          {business.logoUrl ? <Image src={business.logoUrl} alt={business.name || 'Logo del negocio'} maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="38px" color="brand.500" />}
        </Flex>
        <Stack spacing="3px" minW="0" flex="1">
          {business.name && <Heading fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.06">{business.name}</Heading>}
          {business.description && <Text fontSize="sm" color="whiteAlpha.800" noOfLines={{ base: 2, md: 4 }}>{business.description}</Text>}
        </Stack>
        <IconButton aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} icon={<Icon as={favorite ? MdFavorite : MdFavoriteBorder} />} variant="ghost" color={favorite ? 'red.300' : 'white'} onClick={onFavorite} />
      </Flex>

      <Flex mt="16px" gap="9px" wrap="wrap">
        {business.videoUrl && <Button leftIcon={<MdPlayArrow />} size="sm" borderRadius="full" bg="purple.500" _hover={{ bg: 'purple.400' }} onClick={onVideo}>Ver video</Button>}
        {contactLinks.length > 0 && <Button leftIcon={<MdLink />} size="sm" borderRadius="full" colorScheme="cyan" color="navy.900" onClick={onContacts}>{contactsOpen ? 'Ocultar enlaces' : 'Contactar'}</Button>}
      </Flex>

      {contactsOpen && (
        <Flex mt="14px" gap="12px" wrap="wrap" aria-label="Enlaces del negocio">
          {contactLinks.map((link, index) => {
            const meta = linkMeta(link);
            return (
              <Stack key={link} as="a" href={hrefFor(link)} target="_blank" rel="noopener noreferrer" align="center" spacing="4px" color="white" animation={`${bubbleArrival} .22s ease-out ${index * .04}s both`} _hover={{ textDecoration: 'none', transform: 'translateY(-3px)' }}>
                <Flex w={{ base: '44px', md: '50px' }} h={{ base: '44px', md: '50px' }} borderRadius="full" bg={meta.bg} align="center" justify="center" boxShadow="0 10px 22px rgba(0,0,0,.4)"><Icon as={meta.icon} boxSize={{ base: '19px', md: '22px' }} /></Flex>
                <Text fontSize="9px" fontWeight="800">{meta.label}</Text>
              </Stack>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
