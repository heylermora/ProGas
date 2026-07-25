// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdEmail,
  MdLink,
  MdMyLocation,
  MdPlayArrow,
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
const mobileCategoryPositions = [
  [50, 18], [76, 29], [78, 58], [63, 78], [37, 78], [22, 58], [24, 29],
];
const CATEGORIES_PER_SECTOR = 7;
const BUSINESSES_PER_SECTOR = 8;

const astronautFloat = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.06); }
`;
const shadowPulse = keyframes`
  0%, 100% { transform: translateX(-50%) scale(.95); opacity: .38; }
  50% { transform: translateX(-50%) scale(.62); opacity: .16; }
`;
const navigationFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
`;
const panelArrival = keyframes`
  from { opacity: 0; transform: translateY(18px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const mapArrival = keyframes`
  from { opacity: 0; transform: scale(.92); filter: blur(5px); }
  to { opacity: 1; transform: scale(1); filter: blur(0); }
`;
const stationArrival = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(103,232,249,.75); }
  70% { box-shadow: 0 0 0 16px rgba(103,232,249,0); }
  100% { box-shadow: 0 0 0 0 rgba(103,232,249,0); }
`;
const dossierBubblePositions = [
  { top: '0', left: '0' },
  { top: '0', right: '0' },
  { bottom: '0', left: '0' },
  { bottom: '0', right: '0' },
];
const goldenActionStyles = {
  bgGradient: 'linear(135deg, #FFE29F 0%, #D4AF37 45%, #8A5A00 100%)',
  color: 'white',
  border: '2px solid',
  borderColor: 'whiteAlpha.800',
  boxShadow: '0 14px 26px rgba(184, 134, 11, .34)',
  _hover: { transform: 'translateY(-2px) scale(1.04)', filter: 'brightness(1.06)' },
  _focusVisible: { outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' },
};

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
const videoSource = (value = '') => {
  const source = value.match(/src=["']([^"']+)["']/i)?.[1] || value;
  const youtubeId = source.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^?&/]+)/i)?.[1];
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
  const vimeoId = source.match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  return source;
};
const isDirectVideo = (value = '') => value.startsWith('data:video') || /\.(mp4|webm|ogg)(?:\?|$)/i.test(value);
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
  const [loadStatus, setLoadStatus] = useState('loading');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [arrivedBusinessId, setArrivedBusinessId] = useState('');
  const [contactsOpen, setContactsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mobileSector, setMobileSector] = useState(0);
  const [businessSector, setBusinessSector] = useState(0);
  const travelTimer = useRef();
  const panelBg = useColorModeValue('white', 'navy.800');

  const loadBusinesses = () => {
    setLoadStatus('loading');
    SponsorService.getAll()
      .then((data) => { setBusinesses(data); setLoadStatus('success'); })
      .catch(() => { setBusinesses([]); setLoadStatus('error'); });
  };

  useEffect(() => {
    loadBusinesses();
    return () => clearTimeout(travelTimer.current);
  }, []);

  const activeBusinesses = useMemo(() => businesses.filter((business) => business.active !== false), [businesses]);
  const categoryBusinesses = useMemo(
    () => activeBusinesses.filter((business) => business.category === selectedCategory),
    [activeBusinesses, selectedCategory],
  );
  const selectedBusiness = categoryBusinesses.find((business) => business.id === selectedBusinessId);
  const businessSectorCount = Math.max(1, Math.ceil(categoryBusinesses.length / BUSINESSES_PER_SECTOR));
  const visibleBusinesses = categoryBusinesses.slice(businessSector * BUSINESSES_PER_SECTOR, (businessSector + 1) * BUSINESSES_PER_SECTOR);
  const arrivedBusiness = arrivedBusinessId === selectedBusinessId ? selectedBusiness : undefined;
  const selectedCategoryIndex = BUSINESS_CATEGORIES.indexOf(selectedCategory);
  const categoryIcon = categoryEmoji[selectedCategoryIndex] || '🪐';
  const contactLinks = (selectedBusiness?.links || []).filter(Boolean).slice(0, 4);

  const enterCategory = (category) => {
    setSelectedCategory(category);
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setContactsOpen(false);
    setBusinessSector(0);
  };
  const returnToGalaxy = () => {
    setSelectedCategory('');
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setContactsOpen(false);
    setBusinessSector(0);
  };
  const selectBusiness = (id) => {
    clearTimeout(travelTimer.current);
    setSelectedBusinessId(id);
    setArrivedBusinessId('');
    setContactsOpen(false);
    travelTimer.current = setTimeout(() => setArrivedBusinessId(id), 480);
  };
  const changeBusinessSector = (sector) => {
    clearTimeout(travelTimer.current);
    setBusinessSector((sector + businessSectorCount) % businessSectorCount);
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setContactsOpen(false);
  };
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
          {!selectedCategory && (
            <Stack px={{ base: '6px', md: '8px' }} pb="12px" spacing="1px">
              <Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa galáctico</Heading>
              <Text color="gray.500" fontSize="xs">Elegí una categoría para viajar a su submapa.</Text>
            </Stack>
          )}

          <Box position="relative" minH={{ base: '520px', sm: '580px', md: '690px' }} borderRadius={{ base: '18px', md: '26px' }} overflow="hidden" bg="radial-gradient(circle at 50% 46%, #4338CA 0%, #1E1B4B 38%, #070B1F 78%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .75, bgImage: 'radial-gradient(circle at 12% 20%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #fff 0 1px, transparent 2px), radial-gradient(circle at 42% 88%, #fff 0 1.5px, transparent 2.5px)', bgSize: '42px 42px, 58px 58px, 73px 73px' }}>
            <Box position="absolute" inset="8%" border="1px dashed" borderColor="cyan.200" borderRadius="45%" opacity=".24" />
            <Box position="absolute" inset="21%" border="1px dashed" borderColor="purple.200" borderRadius="44%" opacity=".2" />

            {loadStatus === 'loading' && <MapStatus icon="📡" title="Escaneando la galaxia" description="Buscando estaciones comerciales…" />}
            {loadStatus === 'error' && <MapStatus icon="⚠️" title="Se perdió la señal" description="No pudimos cargar los negocios." action="Reintentar" onAction={loadBusinesses} />}
            {loadStatus === 'success' && (
              <Box key={selectedCategory || 'galaxy'} position="absolute" inset="0" animation={`${mapArrival} .38s ease-out`}>
                {!selectedCategory ? (
                  <CategoryMap businesses={activeBusinesses} mobileSector={mobileSector} onSectorChange={setMobileSector} onSelect={enterCategory} />
                ) : (
                  <BusinessMap businesses={visibleBusinesses} totalBusinesses={categoryBusinesses.length} category={selectedCategory} categoryIcon={categoryIcon} selectedId={selectedBusinessId} sector={businessSector} sectorCount={businessSectorCount} onSectorChange={changeBusinessSector} onBack={returnToGalaxy} onSelect={selectBusiness} />
                )}
                <Astronaut selectedCategory={selectedCategory} selectedCategoryIndex={selectedCategoryIndex} selectedBusiness={selectedBusiness} businesses={visibleBusinesses} />
              </Box>
            )}

            {loadStatus === 'success' && selectedCategory && categoryBusinesses.length === 0 && (
              <Stack position="absolute" left="50%" bottom="10%" transform="translateX(-50%)" align="center" textAlign="center" color="white" zIndex={3} w="80%" pointerEvents="none">
                <Text fontSize="38px">🛰️</Text>
                <Heading fontSize="xl">No hay estaciones disponibles</Heading>
                <Text color="whiteAlpha.700" fontSize="sm">Tocá el centro de la zona para regresar al mapa galáctico.</Text>
              </Stack>
            )}

            {loadStatus === 'success' && arrivedBusiness && (
              <BusinessDossier
                business={arrivedBusiness}
                contactsOpen={contactsOpen}
                contactLinks={contactLinks}
                onClose={() => { setSelectedBusinessId(''); setContactsOpen(false); }}
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
              <ModalHeader>{arrivedBusiness?.name || 'Video del negocio'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: '12px', md: '20px' }}>
            {isDirectVideo(arrivedBusiness?.videoUrl || '') ? (
              <Box as="video" src={arrivedBusiness?.videoUrl} controls autoPlay playsInline w="100%" maxH="70vh" borderRadius="16px" />
            ) : (
              <Box as="iframe" title={`Video de ${arrivedBusiness?.name || 'negocio'}`} src={videoSource(arrivedBusiness?.videoUrl)} w="100%" h={{ base: '240px', md: '520px' }} border="0" borderRadius="16px" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PublicPage>
  );
}

function CategoryMap({ businesses, mobileSector, onSectorChange, onSelect }) {
  const sectorCount = Math.ceil(BUSINESS_CATEGORIES.length / CATEGORIES_PER_SECTOR);
  const previousSector = () => onSectorChange((mobileSector - 1 + sectorCount) % sectorCount);
  const nextSector = () => onSectorChange((mobileSector + 1) % sectorCount);

  return (
    <>
      <Box display={{ base: 'block', md: 'none' }} position="absolute" left="8px" top="46%" zIndex={6} animation={`${navigationFloat} 1.8s ease-in-out infinite`} _motionReduce={{ animation: 'none' }}>
        <IconButton aria-label="Ver sector anterior" icon={<Icon as={MdChevronLeft} boxSize="28px" />} w="48px" h="48px" borderRadius="full" bg="rgba(8,14,38,.88)" color="cyan.200" border="1px solid" borderColor="cyan.300" boxShadow="0 0 0 5px rgba(34,211,238,.10), 0 12px 25px rgba(0,0,0,.35)" backdropFilter="blur(10px)" onClick={previousSector} _hover={{ bg: 'rgba(14,116,144,.92)', transform: 'scale(1.06)' }} _active={{ transform: 'scale(.94)' }} />
      </Box>
      <Box display={{ base: 'block', md: 'none' }} position="absolute" right="8px" top="46%" zIndex={6} animation={`${navigationFloat} 1.8s ease-in-out .35s infinite`} _motionReduce={{ animation: 'none' }}>
        <IconButton aria-label="Ver sector siguiente" icon={<Icon as={MdChevronRight} boxSize="28px" />} w="48px" h="48px" borderRadius="full" bg="rgba(8,14,38,.88)" color="cyan.200" border="1px solid" borderColor="cyan.300" boxShadow="0 0 0 5px rgba(34,211,238,.10), 0 12px 25px rgba(0,0,0,.35)" backdropFilter="blur(10px)" onClick={nextSector} _hover={{ bg: 'rgba(14,116,144,.92)', transform: 'scale(1.06)' }} _active={{ transform: 'scale(.94)' }} />
      </Box>
      <Stack display={{ base: 'flex', md: 'none' }} position="absolute" left="50%" bottom="15px" transform="translateX(-50%)" zIndex={6} spacing="0" align="center" minW="92px" px="13px" py="6px" borderRadius="full" bg="rgba(8,14,38,.78)" border="1px solid" borderColor="whiteAlpha.300" backdropFilter="blur(10px)">
        <Text color="cyan.200" fontSize="8px" fontWeight="900" letterSpacing=".12em">SECTOR</Text>
        <Text color="white" fontSize="xs" fontWeight="800">{mobileSector + 1} de {sectorCount}</Text>
      </Stack>

      {BUSINESS_CATEGORIES.map((category, index) => {
        const total = businesses.filter((business) => business.category === category).length;
        const categorySector = Math.floor(index / CATEGORIES_PER_SECTOR);
        const mobileIndex = index % CATEGORIES_PER_SECTOR;
        const [desktopLeft, desktopTop] = categoryPositions[index];
        const [mobileLeft, mobileTop] = mobileCategoryPositions[mobileIndex];
        return (
          <Button key={category} aria-label={`Entrar a ${category}, ${total} negocios`} position="absolute" left={{ base: `${mobileLeft}%`, md: `${desktopLeft}%` }} top={{ base: `${mobileTop}%`, md: `${desktopTop}%` }} transform="translate(-50%, -50%)" w={{ base: '82px', md: '94px' }} h={{ base: '72px', md: '78px' }} minW={{ base: '82px', md: '94px' }} p="7px" variant="unstyled" bg="whiteAlpha.900" color="navy.800" border="3px solid white" borderRadius="20px" boxShadow="0 0 16px rgba(255,255,255,.45)" onClick={() => onSelect(category)} display={{ base: categorySector === mobileSector ? 'flex' : 'none', md: 'flex' }} flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} transition="all .2s ease" _hover={{ transform: 'translate(-50%, -50%) scale(1.09)', boxShadow: '0 0 26px rgba(103,232,249,.9)' }}>
            <Text fontSize={{ base: '25px', md: '28px' }} lineHeight="1">{categoryEmoji[index]}</Text>
            <Text mt="4px" w="100%" noOfLines={1} fontSize="10px" fontWeight="900">{shortLabels[index]}</Text>
            {total > 0 && <Badge position="absolute" right="-4px" top="-5px" minW="22px" fontSize="8px" borderRadius="full" colorScheme="purple">{total}</Badge>}
          </Button>
        );
      })}
    </>
  );
}

function BusinessMap({ businesses, totalBusinesses, category, categoryIcon, selectedId, sector, sectorCount, onSectorChange, onBack, onSelect }) {
  return (
    <>
      <Button aria-label={`Volver al mapa principal desde ${category}`} onClick={onBack} position="absolute" left="50%" top="49%" transform="translate(-50%, -50%)" w={{ base: '108px', md: '146px' }} h={{ base: '108px', md: '146px' }} minW={{ base: '108px', md: '146px' }} p={{ base: '10px', md: '14px' }} variant="unstyled" borderRadius="full" bg="yellow.300" border={{ base: '6px solid', md: '9px solid' }} borderColor="yellow.100" color="navy.800" boxShadow="0 0 35px rgba(250,204,21,.45)" display="flex" flexDirection="column" alignItems="center" justifyContent="center" zIndex={1} transition="transform .2s ease, box-shadow .2s ease" _hover={{ transform: 'translate(-50%, -50%) scale(1.06)', boxShadow: '0 0 48px rgba(250,204,21,.68)' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '4px' }}>
        <Text fontSize={{ base: '27px', md: '38px' }} lineHeight="1">{categoryIcon}</Text>
        <Text mt="5px" fontSize={{ base: '8px', md: '9px' }} fontWeight="900" letterSpacing=".08em">ZONA DE</Text>
        <Text maxW="100%" noOfLines={2} fontSize={{ base: '10px', md: '12px' }} fontWeight="900" lineHeight="1.05">{category}</Text>
      </Button>
      {sectorCount > 1 && (
        <>
          <Box position="absolute" left={{ base: '10px', md: '18px' }} top={{ base: '12px', md: '18px' }} zIndex={6} animation={`${navigationFloat} 1.8s ease-in-out infinite`} _motionReduce={{ animation: 'none' }}>
            <IconButton aria-label="Ver ruta anterior de negocios" icon={<Icon as={MdChevronLeft} boxSize="28px" />} w="48px" h="48px" borderRadius="full" bg="rgba(8,14,38,.88)" color="yellow.200" border="1px solid" borderColor="yellow.300" boxShadow="0 0 0 5px rgba(250,204,21,.10), 0 12px 25px rgba(0,0,0,.35)" onClick={() => onSectorChange(sector - 1)} />
          </Box>
          <Box position="absolute" right={{ base: '10px', md: '18px' }} top={{ base: '12px', md: '18px' }} zIndex={6} animation={`${navigationFloat} 1.8s ease-in-out .35s infinite`} _motionReduce={{ animation: 'none' }}>
            <IconButton aria-label="Ver ruta siguiente de negocios" icon={<Icon as={MdChevronRight} boxSize="28px" />} w="48px" h="48px" borderRadius="full" bg="rgba(8,14,38,.88)" color="yellow.200" border="1px solid" borderColor="yellow.300" boxShadow="0 0 0 5px rgba(250,204,21,.10), 0 12px 25px rgba(0,0,0,.35)" onClick={() => onSectorChange(sector + 1)} />
          </Box>
          <Badge position="absolute" left="50%" bottom="15px" transform="translateX(-50%)" zIndex={6} px="12px" py="6px" borderRadius="full" bg="rgba(8,14,38,.82)" color="yellow.200" border="1px solid" borderColor="whiteAlpha.300">RUTA {sector + 1} DE {sectorCount} · {totalBusinesses} NEGOCIOS</Badge>
        </>
      )}
      {businesses.map((business, index) => {
        const [left, top] = businessPosition(index, businesses.length);
        const selected = business.id === selectedId;
        return (
          <Button key={business.id} aria-label={`Abrir ficha de ${business.name || 'negocio'}`} position="absolute" left={`${left}%`} top={`${top}%`} transform="translate(-50%, -50%)" w={{ base: '66px', sm: '82px', md: '116px' }} h={{ base: '66px', sm: '78px', md: '94px' }} minW={{ base: '66px', sm: '82px', md: '116px' }} p={{ base: '6px', md: '9px' }} variant="unstyled" bg={selected ? 'cyan.100' : 'white'} color="navy.800" border="3px solid" borderColor={selected ? 'cyan.300' : 'white'} borderRadius={{ base: '20px', md: '25px' }} boxShadow={selected ? '0 0 0 5px rgba(103,232,249,.25), 0 0 30px #67E8F9' : '0 10px 20px rgba(0,0,0,.25)'} animation={selected ? `${stationArrival} .7s ease-out` : undefined} onClick={() => onSelect(business.id)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} transition="all .22s ease" _hover={{ transform: 'translate(-50%, -50%) scale(1.07)' }}>
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

function MapStatus({ icon, title, description, action, onAction }) {
  return (
    <Stack position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" zIndex={7} align="center" textAlign="center" color="white" w="82%" spacing="7px">
      <Text fontSize="48px" animation={`${astronautFloat} 1.5s ease-in-out infinite`}>{icon}</Text>
      <Heading fontSize={{ base: 'lg', md: '2xl' }}>{title}</Heading>
      <Text color="whiteAlpha.700" fontSize="sm">{description}</Text>
      {action && <Button mt="6px" size="sm" borderRadius="full" {...goldenActionStyles} onClick={onAction}>{action}</Button>}
    </Stack>
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

function BusinessDossier({ business, contactsOpen, contactLinks, onClose, onContacts, onVideo }) {
  return (
    <Box position="absolute" zIndex={8} right={{ base: '8px', md: '18px' }} bottom={{ base: '8px', md: '18px' }} w={{ base: 'calc(100% - 16px)', md: '370px' }} maxH={{ base: '290px', md: 'calc(100% - 36px)' }} overflowY="auto" p={{ base: '14px', md: '18px' }} borderRadius={{ base: '22px', md: '28px' }} bg="rgba(8, 14, 38, .94)" color="white" border="1px solid" borderColor="cyan.300" boxShadow="0 24px 65px rgba(0,0,0,.52), inset 0 0 28px rgba(34,211,238,.05)" backdropFilter="blur(16px)" animation={`${panelArrival} .24s ease-out`}>
      <Flex align="center" justify="space-between" mb="12px">
        <Badge bg="cyan.300" color="navy.900" borderRadius="full" px="9px">FICHA DE ESTACIÓN</Badge>
        <IconButton aria-label="Cerrar ficha" icon={<MdClose />} size="sm" variant="ghost" color="white" onClick={onClose} />
      </Flex>
      <Flex gap="14px" align="center">
        <BusinessContactHub business={business} links={contactLinks} isOpen={contactsOpen} onToggle={onContacts} />
        <Stack spacing="3px" minW="0" flex="1">
          {business.name && <Heading fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.06">{business.name}</Heading>}
          {business.description && <Text fontSize="sm" color="whiteAlpha.800" noOfLines={{ base: 2, md: 4 }}>{business.description}</Text>}
        </Stack>
      </Flex>

      <Flex mt="16px" gap="9px" wrap="wrap">
        {business.videoUrl && <Button leftIcon={<MdPlayArrow />} size="sm" borderRadius="full" {...goldenActionStyles} onClick={onVideo}>Ver video</Button>}
        {contactLinks.length > 0 && <Button leftIcon={<MdLink />} size="sm" borderRadius="full" {...goldenActionStyles} onClick={onContacts}>{contactsOpen ? 'Ocultar enlaces' : 'Contactar'}</Button>}
      </Flex>
    </Box>
  );
}

function BusinessContactHub({ business, links, isOpen, onToggle }) {
  const hasLinks = links.length > 0;
  return (
    <Box position="relative" w={{ base: '104px', md: '124px' }} h={{ base: '100px', md: '118px' }} flex="0 0 auto" overflow="visible">
      <Flex as="button" type="button" aria-label={hasLinks ? `${isOpen ? 'Ocultar' : 'Mostrar'} redes de ${business.name || 'negocio'}` : `Logo de ${business.name || 'negocio'}`} aria-expanded={hasLinks ? isOpen : undefined} onClick={() => hasLinks && onToggle()} position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" zIndex={2} w={{ base: '68px', md: '82px' }} h={{ base: '68px', md: '82px' }} borderRadius="22px" bg="white" align="center" justify="center" p="9px" cursor={hasLinks ? 'pointer' : 'default'} boxShadow={isOpen ? '0 0 0 4px rgba(212,175,55,.28), 0 12px 28px rgba(0,0,0,.32)' : '0 10px 24px rgba(0,0,0,.26)'} transition="transform .2s ease, box-shadow .2s ease" _hover={hasLinks ? { transform: 'translate(-50%, -50%) scale(1.04)' } : undefined} _focusVisible={hasLinks ? { outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' } : undefined}>
        {business.logoUrl ? <Image src={business.logoUrl} alt={business.name || 'Logo del negocio'} maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="38px" color="brand.500" />}
      </Flex>

      {links.map((link, index) => {
        const meta = linkMeta(link);
        return (
          <Flex key={`${link}-${index}`} as="a" href={hrefFor(link)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${meta.label} de ${business.name || 'negocio'}`} position="absolute" zIndex={3} {...dossierBubblePositions[index]} w={{ base: '38px', md: '43px' }} h={{ base: '38px', md: '43px' }} borderRadius="full" bg={meta.bg} color="white" border="2px solid" borderColor="white" align="center" justify="center" boxShadow="0 12px 22px rgba(0,0,0,.38)" opacity={isOpen ? 1 : 0} visibility={isOpen ? 'visible' : 'hidden'} transform={isOpen ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,10px,0) scale(.55)'} transition={`all .26s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 45 : 0}ms`} _hover={{ textDecoration: 'none', transform: 'translate3d(0,-3px,0) scale(1.08)', filter: 'brightness(1.08)' }} _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '2px' }}>
            <Icon as={meta.icon} boxSize={{ base: '17px', md: '19px' }} />
          </Flex>
        );
      })}
    </Box>
  );
}
