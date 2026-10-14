import { SocialLinksRow } from 'components/social/SocialLink';
import {
Badge,
Box,
Button,
Flex,
Heading,
Icon,
IconButton,
Image,
Input, SimpleGrid,
Stack,
Text,
useColorModeValue
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import AppModal from 'components/modal/AppModal';
import SponsorLocation from 'components/sponsor/SponsorLocation';
import { sponsorLinks, sponsorNavigation, sponsorVideoSource } from 'utils/sponsor';
import useCategories from 'hooks/useCategories';
import SearchableCategorySelect from 'components/category/SearchableCategorySelect';
import SponsorItem from 'interfaces/SponsorItem';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
MdChevronLeft,
MdChevronRight,
MdMap, MdMyLocation,
MdPlayArrow,
MdStorefront,
MdViewList
} from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import { PublicPage } from './PublicPage';

const categoryEmoji = ['🍽️', '🍔', '🍕', '☕', '🍦', '🍷', '🛒', '🛍️', '💎', '👟', '💈', '💇', '🐾', '💊', '🔨', '🌱', '💪', '🏍️', '🔧', '🛡️', '✨'];
const shortLabels = ['Restaurantes', 'Rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías', 'Licoreras', 'Súperes', 'Tiendas', 'Joyerías', 'Zapaterías', 'Barberías', 'Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agro', 'Gimnasios', 'Motos', 'Mecánicos', 'Fumigadoras', 'Otros'];
const categoryPositions = [
  [50, 9], [68, 13], [84, 25], [91, 43], [85, 62], [70, 79], [50, 89],
  [30, 79], [15, 62], [9, 43], [16, 25], [32, 13], [39, 29], [61, 29],
  [73, 44], [62, 60], [38, 60], [27, 44], [50, 21], [76, 70], [24, 70],
];
const CATEGORIES_PER_SECTOR = 8;
const BUSINESSES_PER_SECTOR = 8;

const astronautFloat = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.06); }
`;
const shadowPulse = keyframes`
  0%, 100% { transform: translateX(-50%) scale(.95); opacity: .38; }
  50% { transform: translateX(-50%) scale(.62); opacity: .16; }
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
const goldenActionStyles = {
  bgGradient: 'linear(135deg, #FFE29F 0%, #D4AF37 45%, #8A5A00 100%)',
  color: 'white',
  border: '2px solid',
  borderColor: 'whiteAlpha.800',
  boxShadow: '0 14px 26px rgba(184, 134, 11, .34)',
  _hover: { transform: 'translateY(-2px) scale(1.04)', filter: 'brightness(1.06)' },
  _focusVisible: { outline: '3px solid', outlineColor: 'yellow.300', outlineOffset: '3px' },
};


const videoSource = (value = '') => sponsorVideoSource(value) || value.match(/src=["']([^"']+)["']/i)?.[1] || value;
const isDirectVideo = (value = '') => value.startsWith('data:video') || /\.(mp4|webm|ogg)(?:\?|$)/i.test(value);
const businessPosition = (index: number, total: number): number[] => {
  const ring = index < 8 ? 0 : 1;
  const ringIndex = ring ? index - 8 : index;
  const ringTotal = ring ? Math.max(1, total - 8) : Math.min(total, 8);
  const angle = (ringIndex / ringTotal) * Math.PI * 2 - Math.PI / 2;
  const radiusX = ring ? 26 : 39;
  const radiusY = ring ? 24 : 36;
  return [50 + Math.cos(angle) * radiusX, 49 + Math.sin(angle) * radiusY];
};

export default function VirtualMall() {
  const { categories } = useCategories('sponsors');
  const location = useLocation();
  const [businesses, setBusinesses] = useState<SponsorItem[]>([]);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [visitedBusinessIds, setVisitedBusinessIds] = useState<string[]>([]);
  const [arrivedBusinessId, setArrivedBusinessId] = useState('');
  const [dossierOpen, setDossierOpen] = useState(false);
  const stationTrigger = useRef<HTMLButtonElement | null>(null);
  const videoTrigger = useRef<HTMLButtonElement | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mobileSector, setMobileSector] = useState(0);
  const [businessSector, setBusinessSector] = useState(0);
  const [simpleView, setSimpleView] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [simpleCategory, setSimpleCategory] = useState('');
  const [simpleSearch, setSimpleSearch] = useState('');
  const travelTimer = useRef<ReturnType<typeof setTimeout>>();
  const panelBg = useColorModeValue('white', 'navy.800');

  const loadBusinesses = useCallback(() => {
    setLoadStatus('loading');
    SponsorService.getAll()
      .then((data) => {
        setBusinesses(data);
        const requestedBusinessId = new URLSearchParams(location.search).get('business');
        const requestedBusiness = requestedBusinessId
          ? data.find((business) => business.id === requestedBusinessId && business.active !== false)
          : undefined;

        if (requestedBusiness) {
          const businessesInCategory = data.filter(
            (business) => business.active !== false && business.category === requestedBusiness.category,
          );
          const requestedIndex = businessesInCategory.findIndex((business) => business.id === requestedBusiness.id);
          setSelectedCategory(requestedBusiness.category);
          setBusinessSector(Math.max(0, Math.floor(requestedIndex / BUSINESSES_PER_SECTOR)));
          setSelectedBusinessId(requestedBusiness.id);
          setArrivedBusinessId(requestedBusiness.id);
          setDossierOpen(true);
        }
        setLoadStatus('success');
      })
      .catch(() => { setBusinesses([]); setLoadStatus('error'); });
  }, [location.search]);

  useEffect(() => {
    loadBusinesses();
    return () => clearTimeout(travelTimer.current);
  }, [loadBusinesses]);

  const activeBusinesses = useMemo(() => businesses.filter((business) => business.active !== false), [businesses]);
  const categoryBusinesses = useMemo(
    () => activeBusinesses.filter((business) => business.category === selectedCategory),
    [activeBusinesses, selectedCategory],
  );
  const selectedBusiness = categoryBusinesses.find((business) => business.id === selectedBusinessId);
  const businessSectorCount = Math.max(1, Math.ceil(categoryBusinesses.length / BUSINESSES_PER_SECTOR));
  const visibleBusinesses = categoryBusinesses.slice(businessSector * BUSINESSES_PER_SECTOR, (businessSector + 1) * BUSINESSES_PER_SECTOR);
  const arrivedBusiness = arrivedBusinessId === selectedBusinessId ? selectedBusiness : undefined;
  const selectedCategoryIndex = categories.indexOf(selectedCategory);
  const categoryIcon = categoryEmoji[selectedCategoryIndex] || '🪐';
  const contactLinks = selectedBusiness ? sponsorLinks(selectedBusiness) : [];

  const enterCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setDossierOpen(false);
    setBusinessSector(0);
  };
  const returnToGalaxy = () => {
    setSelectedCategory('');
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setDossierOpen(false);
    setBusinessSector(0);
  };
  const selectBusiness = (id: string, trigger: HTMLButtonElement) => {
    stationTrigger.current = trigger;
    clearTimeout(travelTimer.current);
    setSelectedBusinessId(id);
    setVisitedBusinessIds((ids) => ids.includes(id) ? ids : [...ids, id]);
    setArrivedBusinessId('');
    setDossierOpen(false);
    travelTimer.current = setTimeout(() => { setArrivedBusinessId(id); setDossierOpen(true); }, 480);
  };
  const changeBusinessSector = (sector: number) => {
    clearTimeout(travelTimer.current);
    setBusinessSector((sector + businessSectorCount) % businessSectorCount);
    setSelectedBusinessId('');
    setArrivedBusinessId('');
    setDossierOpen(false);
  };
  return (
    <PublicPage maxW="1280px">
      <Stack spacing={{ base: '10px', md: '18px' }}>
        <Box borderRadius={{ base: '24px', md: '34px' }} overflow="hidden" p={{ base: '14px', md: '22px' }} bgGradient="linear(135deg, #111827 0%, #312E81 48%, #0284C7 100%)" color="white" position="relative">
          <Box position="absolute" right="-25px" top="-60px" fontSize={{ base: '140px', md: '190px' }} opacity=".11">🕹️</Box>
          <Flex position="relative" align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap={{ base: '8px', md: '14px' }} direction={{ base: 'column', md: 'row' }}>
          <Stack spacing={{ base: '4px', md: '6px' }} maxW="760px" minW="0">
            <Badge w="fit-content" px="10px" py="2px" fontSize={{ base: '10px', md: 'xs' }} borderRadius="full" bg="cyan.300" color="navy.800" letterSpacing=".08em">MODO EXPLORACIÓN</Badge>
            <Heading fontSize={{ base: '22px', md: '36px' }} lineHeight="1.1">Centro Comercial Virtual</Heading>
            <Text fontSize={{ base: 'xs', md: 'md' }} lineHeight="1.4" color="whiteAlpha.900">
              <Box as="span" display={{ base: 'inline', md: 'none' }}>Elegí una categoría y explorá sus negocios.</Box>
              <Box as="span" display={{ base: 'none', md: 'inline' }}>Viajá por el mapa, entrá a una categoría y descubrí cada negocio en su propia estación.</Box>
            </Text>
          </Stack>
          <Button leftIcon={<Icon as={simpleView ? MdMap : MdViewList} />} bg="white" color="navy.800" borderRadius="full" size="md" minH="44px" fontSize={{ base: 'sm', md: 'md' }} px={{ base: '16px', md: '20px' }} flexShrink={0} onClick={() => setSimpleView((value) => !value)} _hover={{ bg: 'cyan.50', transform: 'translateY(-1px)' }}>{simpleView ? 'Ver mapa interactivo' : 'Usar vista sencilla'}</Button>
          </Flex>
        </Box>

        {simpleView ? <SimpleMall categories={categories} businesses={activeBusinesses} selectedCategory={simpleCategory} onCategory={setSimpleCategory} search={simpleSearch} onSearch={setSimpleSearch} /> : <Box bg={panelBg} borderRadius={{ base: '22px', md: '30px' }} p={{ base: '8px', md: '16px' }} boxShadow="xl" overflow="hidden">
          {!selectedCategory && (
            <Stack px={{ base: '6px', md: '8px' }} pb="12px" spacing="1px">
              <Heading fontSize={{ base: 'lg', md: 'xl' }}>Mapa galáctico</Heading>
              <Text color="gray.500" fontSize="xs">Elegí una categoría para viajar a su submapa.</Text>
            </Stack>
          )}

          <Box position="relative" minH={{ base: '800px', sm: '800px', md: '740px' }} borderRadius={{ base: '18px', md: '26px' }} overflow="hidden" bg="radial-gradient(circle at 50% 46%, #4338CA 0%, #1E1B4B 38%, #070B1F 78%)" _before={{ content: '""', position: 'absolute', inset: 0, opacity: .75, bgImage: 'radial-gradient(circle at 12% 20%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #fff 0 1px, transparent 2px), radial-gradient(circle at 42% 88%, #fff 0 1.5px, transparent 2.5px)', bgSize: '42px 42px, 58px 58px, 73px 73px' }}>
            <Box display={{ base: 'block', md: 'none' }} position="absolute" top="120px" bottom="132px" left="50%" borderLeft="1px dashed" borderColor="cyan.300" opacity=".4" pointerEvents="none" />
            <Box position="absolute" inset="8%" border="1px dashed" borderColor="cyan.200" borderRadius="45%" opacity=".24" />
            <Box position="absolute" inset="21%" border="1px dashed" borderColor="purple.200" borderRadius="44%" opacity=".2" />

            {loadStatus === 'loading' && <MapStatus icon="📡" title="Escaneando la galaxia" description="Buscando estaciones comerciales…" />}
            {loadStatus === 'error' && <MapStatus icon="⚠️" title="Se perdió la señal" description="No pudimos cargar los negocios." action="Reintentar" onAction={loadBusinesses} />}
            {loadStatus === 'success' && (
              <Box key={selectedCategory || 'galaxy'} position="absolute" inset="0" animation={`${mapArrival} .38s ease-out`}>
                {!selectedCategory ? (
                  <CategoryMap categories={categories} businesses={activeBusinesses} mobileSector={mobileSector} onSectorChange={setMobileSector} onSelect={enterCategory} />
                ) : (
                  <BusinessMap businesses={visibleBusinesses} totalBusinesses={categoryBusinesses.length} category={selectedCategory} categoryIcon={categoryIcon} selectedId={selectedBusinessId} visitedIds={visitedBusinessIds} sector={businessSector} sectorCount={businessSectorCount} onSectorChange={changeBusinessSector} onBack={returnToGalaxy} onSelect={selectBusiness} />
                )}
                <Astronaut selectedCategory={selectedCategory} selectedCategoryIndex={selectedCategoryIndex} selectedBusiness={selectedBusiness} businesses={visibleBusinesses} travelling={Boolean(selectedBusiness && !arrivedBusiness)} />
              </Box>
            )}

            {loadStatus === 'success' && selectedCategory && categoryBusinesses.length === 0 && (
              <Stack position="absolute" left="50%" bottom="10%" transform="translateX(-50%)" align="center" textAlign="center" color="white" zIndex={3} w="80%" pointerEvents="none">
                <Text fontSize="38px">🛰️</Text>
                <Heading fontSize="xl">No hay estaciones disponibles</Heading>
                <Text color="whiteAlpha.700" fontSize="sm">Usá «Volver al mapa principal» para explorar otra categoría.</Text>
              </Stack>
            )}

            {loadStatus === 'success' && arrivedBusiness && (
              <BusinessDossier
                business={arrivedBusiness}
                key={arrivedBusiness.id}
                isOpen={dossierOpen}
                finalFocusRef={stationTrigger}
                contactLinks={contactLinks}
                onClose={() => { setDossierOpen(false); setVideoOpen(false); }}
                onVideo={(trigger) => { videoTrigger.current = trigger; setVideoOpen(true); }}
              />
            )}
          </Box>
        </Box>}
      </Stack>

      <AppModal finalFocusRef={videoTrigger} isOpen={videoOpen} onClose={() => setVideoOpen(false)} size="4xl" appearance="media" title={arrivedBusiness?.name || 'Video del negocio'}>
            {isDirectVideo(arrivedBusiness?.videoUrl || '') ? (
              <Box as="video" aria-label={`Video de ${arrivedBusiness?.name || 'negocio'}`} src={arrivedBusiness?.videoUrl} controls autoPlay playsInline w="100%" maxH="60vh" borderRadius="16px" />
            ) : (
              <Box as="iframe" title={`Video de ${arrivedBusiness?.name || 'negocio'}`} src={videoSource(arrivedBusiness?.videoUrl)} w="100%" h={{ base: '220px', md: '440px' }} maxH="60vh" border="0" borderRadius="16px" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            )}
      </AppModal>
    </PublicPage>
  );
}

function SimpleMall({ categories, businesses, selectedCategory, onCategory, search, onSearch }: { categories: string[]; businesses: SponsorItem[]; selectedCategory: string; onCategory: (category: string) => void; search: string; onSearch: (search: string) => void }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const surface = useColorModeValue('white', 'navy.800');
  const term = search.trim().toLocaleLowerCase('es');
  const visible = businesses.filter((business) => (!selectedCategory || business.category === selectedCategory)
    && (!term || [business.name, business.description, business.category].some((value) => String(value || '').toLocaleLowerCase('es').includes(term))));
  return (
    <Box bg={surface} borderRadius={{ base: '22px', md: '30px' }} p={{ base: '18px', md: '26px' }} boxShadow="lg">
      <Stack spacing="20px">
        <Box><Heading fontSize={{ base: '2xl', md: '3xl' }}>Directorio de negocios</Heading><Text color={muted} mt="5px">Elegí una categoría o escribí el nombre de un negocio. No necesitás usar el mapa.</Text></Box>
        <Input aria-label="Buscar negocio" size="lg" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar negocio o servicio" />
        <SearchableCategorySelect categories={categories} value={selectedCategory} onChange={onCategory} />
        <Text fontWeight="700">{visible.length} {visible.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}</Text>
        {visible.length ? <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">{visible.map((business) => {
          const links = sponsorLinks(business);
          return <Box key={business.id} border="1px solid" borderColor={border} borderRadius="20px" p={{ base: '16px', md: '18px' }}>
            <Flex gap="14px" align="center"><Flex w="64px" h="64px" borderRadius="16px" bg="gray.50" align="center" justify="center" p="8px" flexShrink={0}>{business.logoUrl ? <Image src={business.logoUrl} alt={`Logo de ${business.name || 'negocio'}`} maxW="100%" maxH="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="30px" color="brand.500" />}</Flex><Box minW={0}><Heading fontSize="lg">{business.name || 'Negocio local'}</Heading><Badge mt="5px" colorScheme="purple">{business.category}</Badge></Box></Flex>
            {business.description && <Text color={muted} fontSize="sm" lineHeight="1.6" mt="12px">{business.description}</Text>}
            <SponsorLocation sponsor={business} />
            {links.length > 0 && <SocialLinksRow links={links} businessId={business.id} source="mall" label={`Redes sociales de ${business.name}`} />}
          </Box>;
        })}</SimpleGrid> : <Box textAlign="center" py="40px"><Icon as={MdStorefront} boxSize="42px" color="gray.300" /><Text fontWeight="800" mt="10px">No encontramos negocios</Text><Text color={muted}>Probá con otra categoría o borrá la búsqueda.</Text></Box>}
      </Stack>
    </Box>
  );
}

// Mobile stations use a dedicated grid; the cockpit has its own reserved area.
function FlightControls({ sector, sectorCount, onPrevious, onNext, label, mobileOnly = false }: { sector: number; sectorCount: number; onPrevious: () => void; onNext: () => void; label: string; mobileOnly?: boolean }) {
  return (
    <Flex as="nav" aria-label={label} display={mobileOnly ? { base: 'flex', md: 'none' } : 'flex'} position="absolute" bottom="12px" left="12px" right="12px" h="84px" align="center" justify="space-between" gap="8px" px={{ base: '10px', md: '20px' }} borderRadius="20px" bg="linear-gradient(180deg, #162642, #080E26)" border="1px solid" borderColor="cyan.300" boxShadow="inset 0 2px 0 rgba(103,232,249,.25), 0 0 18px rgba(34,211,238,.12)" zIndex={6}>
      <IconButton aria-label={`${label}: anterior`} icon={<Icon as={MdChevronLeft} boxSize="30px" />} onClick={onPrevious} isDisabled={sectorCount <= 1} flexShrink={0} w="52px" h="52px" borderRadius="full" bg="#0B1630" color="cyan.200" border="2px solid" borderColor="cyan.400" boxShadow="inset 0 -5px 0 rgba(0,0,0,.5), 0 0 12px rgba(34,211,238,.18)" _hover={{ bg: 'cyan.900' }} _focusVisible={{ outline: '3px solid white', outlineOffset: '3px' }} />
      <Stack spacing="1px" align="center" minW={0} textAlign="center" flex="1" role="status" aria-live="polite">
        <Text color="cyan.200" fontSize="9px" letterSpacing=".08em" fontWeight="900" whiteSpace="nowrap">CABINA DE MANDO</Text>
        <Text color="white" fontSize="sm" fontWeight="800">{label} {sector + 1} / {sectorCount}</Text>
      </Stack>
      <IconButton aria-label={`${label}: siguiente`} icon={<Icon as={MdChevronRight} boxSize="30px" />} onClick={onNext} isDisabled={sectorCount <= 1} flexShrink={0} w="52px" h="52px" borderRadius="full" bg="#0B1630" color="cyan.200" border="2px solid" borderColor="cyan.400" boxShadow="inset 0 -5px 0 rgba(0,0,0,.5), 0 0 12px rgba(34,211,238,.18)" _hover={{ bg: 'cyan.900' }} _focusVisible={{ outline: '3px solid white', outlineOffset: '3px' }} />
    </Flex>
  );
}

function CategoryMap({ categories, businesses, mobileSector, onSectorChange, onSelect }: { categories: string[]; businesses: SponsorItem[]; mobileSector: number; onSectorChange: (sector: number) => void; onSelect: (category: string) => void }) {
  const sectorCount = Math.max(1, Math.ceil(categories.length / CATEGORIES_PER_SECTOR));
  const visibleCount = categories.slice(mobileSector * CATEGORIES_PER_SECTOR, (mobileSector + 1) * CATEGORIES_PER_SECTOR).length;
  return (
    <>
      <Text display={{ base: 'block', md: 'none' }} position="absolute" top="20px" left="20px" right="20px" color="cyan.100" textAlign="center" fontWeight="800">Elegí tu próximo destino</Text>
      <FlightControls sector={mobileSector} sectorCount={sectorCount} label="Sector" mobileOnly onPrevious={() => onSectorChange((mobileSector - 1 + sectorCount) % sectorCount)} onNext={() => onSectorChange((mobileSector + 1) % sectorCount)} />
      <Box display={{ base: 'grid', md: 'contents' }} position={{ base: 'absolute', md: 'static' }} top="70px" bottom="132px" left="16px" right="16px" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gridTemplateRows={`repeat(${Math.max(1, Math.ceil(visibleCount / 2))}, minmax(0, 1fr))`} columnGap="44px" rowGap="24px" alignItems="center">
        {categories.map((category, index) => {
          const total = businesses.filter((business) => business.category === category).length;
          const categorySector = Math.floor(index / CATEGORIES_PER_SECTOR);
          const mobileIndex = index % CATEGORIES_PER_SECTOR;
          const [left, top] = categoryPositions[index] || businessPosition(index, categories.length);
          return (
            <Button key={category} aria-label={`Entrar a ${category}, ${total} negocios`} position={{ base: 'relative', md: 'absolute' }} left={{ base: 'auto', md: `${left}%` }} top={{ base: 'auto', md: `${top}%` }} transform={{ base: 'none', md: 'translate(-50%, -50%)' }} gridColumn={visibleCount % 2 === 1 && mobileIndex === visibleCount - 1 ? '1 / -1' : undefined} justifySelf="center" w={{ base: visibleCount === 1 ? '170px' : 'min(100%, 150px)', md: '94px' }} h={{ base: '112px', md: '78px' }} minW="0" p="8px" variant="unstyled" bg="whiteAlpha.900" color="navy.800" border="2px solid white" borderRadius="38%" boxShadow="0 0 0 5px rgba(167,139,250,.12), 0 0 22px rgba(167,139,250,.35)" onClick={() => onSelect(category)} display={{ base: categorySector === mobileSector ? 'flex' : 'none', md: 'flex' }} flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} _hover={{ bg: 'cyan.50' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '4px' }}>
              <Text fontSize={{ base: '36px', md: '28px' }} lineHeight="1">{categoryEmoji[index] || '🪐'}</Text>
              <Text mt="6px" w="100%" noOfLines={2} fontSize={{ base: '12px', md: '10px' }} fontWeight="900">{shortLabels[index] || category}</Text>
              {total > 0 && <Badge position="absolute" right="5px" top="5px" minW="22px" fontSize="10px" borderRadius="full" colorScheme="purple">{total}</Badge>}
            </Button>
          );
        })}
      </Box>
    </>
  );
}

function BusinessMap({ businesses, totalBusinesses, category, categoryIcon, selectedId, visitedIds, sector, sectorCount, onSectorChange, onBack, onSelect }: { businesses: SponsorItem[]; totalBusinesses: number; category: string; categoryIcon: string; selectedId?: string; visitedIds: string[]; sector: number; sectorCount: number; onSectorChange: (sector: number) => void; onBack: () => void; onSelect: (id: string, trigger: HTMLButtonElement) => void }) {
  return (
    <>
      <Stack position="absolute" top="12px" left="16px" right="16px" align="center" spacing="6px" zIndex={6}>
        <Button
          aria-label="Volver al mapa principal"
          onClick={onBack}
          leftIcon={<Flex as="span" align="center" justify="center" boxSize="28px" borderRadius="full" bg="rgba(103,232,249,.12)" color="cyan.200"><Icon as={MdChevronLeft} boxSize="22px" /></Flex>}
          alignSelf="flex-start"
          h="44px"
          maxW="100%"
          pl="7px"
          pr="16px"
          iconSpacing="8px"
          bg="rgba(7,11,31,.92)"
          color="whiteAlpha.900"
          border="1px solid"
          borderColor="rgba(103,232,249,.3)"
          borderRadius="full"
          fontSize="sm"
          fontWeight="600"
          boxShadow="0 4px 12px rgba(0,0,0,.18)"
          _hover={{ bg: 'rgba(22,40,65,.98)', borderColor: 'cyan.200', color: 'white' }}
          _active={{ bg: 'rgba(30,55,80,.98)' }}
          _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '3px' }}
        >
          Volver al mapa
        </Button>
        <Flex w="100%" gap="6px" align="center" justify="space-between" aria-label={`${totalBusinesses} negocios en esta zona`}>
          <Text color="white" fontWeight="800" fontSize="xs" noOfLines={1}>{categoryIcon} {category}</Text>
          <Badge flexShrink={0} bg="rgba(103,232,249,.12)" color="cyan.100" borderRadius="full" px="8px" fontSize="9px">{businesses.filter((business) => visitedIds.includes(business.id)).length} / {businesses.length} EXPLORADAS</Badge>
        </Flex>
      </Stack>
      <Stack display={{ base: 'none', md: 'flex' }} position="absolute" left="50%" top="46%" transform="translate(-50%, -50%)" w="140px" align="center" textAlign="center" color="yellow.100" pointerEvents="none">
        <Text fontSize="38px">{categoryIcon}</Text><Text fontWeight="900" fontSize="sm">{category}</Text>
      </Stack>
      <FlightControls sector={sector} sectorCount={sectorCount} label="Ruta" onPrevious={() => onSectorChange(sector - 1)} onNext={() => onSectorChange(sector + 1)} />
      <Box display={{ base: 'grid', md: 'contents' }} position={{ base: 'absolute', md: 'static' }} top="112px" bottom="132px" left="16px" right="16px" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gridTemplateRows={`repeat(${Math.max(1, Math.ceil(businesses.length / 2))}, minmax(0, 1fr))`} columnGap="44px" rowGap="24px" alignItems="center">
        {businesses.map((business, index) => {
          const [left, top] = businessPosition(index, businesses.length);
          const selected = business.id === selectedId;
          const visited = visitedIds.includes(business.id);
          return (
            <Button key={business.id} aria-label={`Abrir ficha de ${business.name || 'negocio'}`} position={{ base: 'relative', md: 'absolute' }} left={{ base: 'auto', md: `${left}%` }} top={{ base: 'auto', md: `${top * .78 + 7}%` }} transform={{ base: 'none', md: 'translate(-50%, -50%)' }} gridColumn={businesses.length % 2 === 1 && index === businesses.length - 1 ? '1 / -1' : undefined} justifySelf="center" w={{ base: businesses.length === 1 ? '180px' : 'min(100%, 150px)', md: '116px' }} h={{ base: '112px', md: '104px' }} minW="0" p="6px" variant="unstyled" bg={selected ? 'cyan.100' : 'white'} color="navy.800" border="2px solid" borderColor={selected ? 'cyan.300' : visited ? 'purple.300' : 'white'} borderRadius="30%" boxShadow={selected ? '0 0 0 3px rgba(103,232,249,.25), 0 0 20px #67E8F9' : '0 0 0 4px rgba(167,139,250,.12), 0 10px 25px rgba(0,0,0,.3)'} animation={selected ? `${stationArrival} .7s ease-out` : undefined} onClick={(event) => onSelect(business.id, event.currentTarget)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" zIndex={2} _hover={{ bg: 'cyan.50' }} _focusVisible={{ outline: '3px solid', outlineColor: 'cyan.200', outlineOffset: '4px' }}>
              <Flex w="100%" h={{ base: '78px', md: '70px' }} align="center" justify="center">
                {business.logoUrl ? <Image src={business.logoUrl} alt="" w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="48px" color="brand.500" />}
              </Flex>
              {business.name && <Text mt="4px" w="100%" noOfLines={1} fontSize={{ base: '11px', md: '12px' }} fontWeight="900">{business.name}</Text>}
            </Button>
          );
        })}
      </Box>
    </>
  );
}

function MapStatus({ icon, title, description, action, onAction }: { icon: React.ReactNode; title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <Stack position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" zIndex={7} align="center" textAlign="center" color="white" w="82%" spacing="7px">
      <Text fontSize="48px" animation={`${astronautFloat} 1.5s ease-in-out infinite`}>{icon}</Text>
      <Heading fontSize={{ base: 'lg', md: '2xl' }}>{title}</Heading>
      <Text color="whiteAlpha.700" fontSize="sm">{description}</Text>
      {action && <Button mt="6px" size="sm" borderRadius="full" {...goldenActionStyles} onClick={onAction}>{action}</Button>}
    </Stack>
  );
}

function Astronaut({ selectedCategory, selectedCategoryIndex, selectedBusiness, businesses, travelling }: { selectedCategory: string; selectedCategoryIndex: number; selectedBusiness?: SponsorItem; businesses: SponsorItem[]; travelling: boolean }) {
  let position = selectedCategory ? [50, 49] : [50, 50];
  if (!selectedCategory) position = [50, 50];
  else if (selectedBusiness) position = businessPosition(Math.max(0, businesses.findIndex((item) => item.id === selectedBusiness.id)), Math.min(businesses.length, 16));
  else if (selectedCategoryIndex >= 0) position = [50, 60];
  const index = Math.max(0, businesses.findIndex((business) => business.id === selectedBusiness?.id));
  const rows = Math.max(1, Math.ceil(businesses.length / 2));
  const fraction = (Math.floor(index / 2) + .5) / rows;
  const centered = businesses.length % 2 === 1 && index === businesses.length - 1;
  const mobileTop = selectedBusiness ? `calc(${fraction * 100}% + ${112 - fraction * 244 + (centered ? 82 : 0)}px)` : selectedCategory ? '105px' : '70px';
  return (
    <Stack aria-label={selectedBusiness ? `Astronauta en ${selectedBusiness.name}` : 'Astronauta listo para explorar'} position="absolute" left={{ base: '50%', md: `${position[0]}%` }} top={{ base: mobileTop, md: `${Math.min(position[1] * .78 + 16, 78)}%` }} transform="translate(-50%, -50%)" w={{ base: '40px', md: '106px' }} align="center" spacing="0" zIndex={4} transition="left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)" pointerEvents="none" sx={{ '@media (prefers-reduced-motion: reduce)': { transition: 'none', '& *': { animation: 'none' } } }}>
      <Badge display={{ base: 'none', md: 'block' }} whiteSpace="nowrap" colorScheme="red" borderRadius="full" fontSize={{ base: '8px', md: '10px' }}><Icon as={MdMyLocation} mr="3px" /> {travelling ? 'EN RUTA' : 'ESTÁS AQUÍ'}</Badge>
      <Box position="relative" w={{ base: '36px', md: '62px' }} h={{ base: '40px', md: '52px' }} display="flex" justifyContent="center">
        <Box position="absolute" bottom="1px" left="50%" w="38px" h="10px" borderRadius="full" bg="blackAlpha.500" animation={`${shadowPulse} 1s ease-in-out infinite`} />
        <Box position="relative" zIndex={1} animation={`${astronautFloat} 1s ease-in-out infinite`} fontSize={{ base: '32px', md: '45px' }} lineHeight="1">🧑‍🚀</Box>
      </Box>
    </Stack>
  );
}

function BusinessDossier({ business, isOpen, finalFocusRef, contactLinks, onClose, onVideo }: { business: SponsorItem; isOpen: boolean; finalFocusRef: React.RefObject<HTMLButtonElement>; contactLinks: string[]; onClose: () => void; onVideo: (trigger: HTMLButtonElement) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasLocation = Boolean(business.directions || sponsorNavigation(business.coordinates, business.mapsUrl, business.wazeUrl));
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      finalFocusRef={finalFocusRef.current ? finalFocusRef : undefined}
      appearance="media"
      placement="station"
      title={<Flex align="center" gap="14px" pr="4px">
        <Flex boxSize="80px" flexShrink={0} bg="white" borderRadius="20px" p="6px" align="center" justify="center">
          {business.logoUrl ? <Image src={business.logoUrl} alt={`Logo de ${business.name || 'negocio'}`} w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} boxSize="44px" color="brand.500" />}
        </Flex>
        <Text minW="0" overflowWrap="anywhere">{business.name || 'Negocio local'}</Text>
      </Flex>}
      description={business.category ? `ESTACIÓN · ${business.category}` : 'ESTACIÓN'}
      footer={<Button onClick={onClose} w="100%" minH="44px" leftIcon={<MdChevronLeft />} bg="cyan.200" color="navy.900" borderRadius="full" _hover={{ bg: 'cyan.100' }}>Seguir explorando</Button>}
    >
      <Stack spacing="20px">
        {business.description && <Box>
          <Text fontSize="sm" lineHeight="1.6" color="whiteAlpha.900" whiteSpace="pre-line" overflowWrap="anywhere">{!expanded && business.description.length > 180 ? `${business.description.slice(0, 180).trimEnd()}…` : business.description}</Text>
          {business.description.length > 180 && <Button variant="link" color="cyan.200" minH="44px" fontSize="sm" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>{expanded ? 'Ver menos' : 'Ver más'}</Button>}
        </Box>}
        {contactLinks.length > 0 && <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing=".06em" color="cyan.100">CONTACTÁ AL NEGOCIO</Text>
          <SocialLinksRow links={contactLinks} businessId={business.id} source="mall" label={`Redes sociales de ${business.name}`} size="regular" />
        </Box>}
        {hasLocation && <Box borderTop="1px solid" borderColor="whiteAlpha.200" pt="16px">
          <Text fontSize="sm" fontWeight="700">Cómo llegar</Text>
          <SponsorLocation sponsor={business} />
        </Box>}
        {business.videoUrl && <Button onClick={(event) => onVideo(event.currentTarget)} leftIcon={<MdPlayArrow />} variant="outline" color="cyan.100" borderColor="whiteAlpha.400" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.100' }}>Ver video del negocio</Button>}
      </Stack>
    </AppModal>
  );
}
