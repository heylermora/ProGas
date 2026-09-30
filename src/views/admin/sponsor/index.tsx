import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay,
  Badge, Box, Button, Center, Flex, FormControl, FormLabel, HStack, Icon, Image,
  Select, SimpleGrid, Stack, Switch, Text, Textarea,
  useColorModeValue, useDisclosure, useToast,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdAdd, MdDelete, MdDragIndicator, MdEdit, MdSettings, MdStorefront, MdTune, MdVisibility } from 'react-icons/md';
import Card from 'components/card/Card';
import EmptyState from 'components/dataDisplay/EmptyState';
import PageHeader from 'components/layout/PageHeader';
import SponsorService from 'services/SponsorService';
import SponsorItem, { DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';
import SponsorDisplaySettingsService, { defaultSponsorDisplaySettings } from 'services/SponsorDisplaySettingsService';
import { usePageSearch } from 'contexts/PageSearchContext';
import useCategories from 'hooks/useCategories';
import CategoryManager from 'components/category/CategoryManager';
import AsyncContent from 'components/dataDisplay/AsyncContent';

export default function SponsorsAdmin() {
  const { query } = usePageSearch();
  const { categories, reload: reloadCategories } = useCategories('sponsors');
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_BUSINESS_CATEGORY);
  const [draggedSponsorId, setDraggedSponsorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [availableCopy, setAvailableCopy] = useState(defaultSponsorDisplaySettings);
  const [savingAvailableCopy, setSavingAvailableCopy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SponsorItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const categoryManager = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const subtleBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const load = useCallback(async () => {
    setLoading(true);
    try { setSponsors(await SponsorService.getAll()); }
    catch { toast({ status: 'error', title: 'No se pudieron cargar los patrocinadores' }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { SponsorDisplaySettingsService.get().then(setAvailableCopy); }, []);

  const availableCategories = useMemo(() => Array.from(new Set([...categories, ...sponsors.map((sponsor) => sponsor.category).filter(Boolean)])), [categories, sponsors]);
  const sponsorsByCategory = useMemo(() => availableCategories.reduce<Record<string, SponsorItem[]>>((acc, type) => ({
    ...acc,
    [type]: sponsors.filter((sponsor) => sponsor.category === type),
  }), {}), [availableCategories, sponsors]);

  const searchTerm = query.trim().toLocaleLowerCase('es');
  const currentBusinesses = [...(sponsorsByCategory[selectedCategory] || [])]
    .sort((a, b) => a.order - b.order || (a.name || '').localeCompare(b.name || ''));
  const matchesSearch = (sponsor: SponsorItem) => [sponsor.name, sponsor.description, sponsor.category]
    .some((value) => String(value || '').toLocaleLowerCase('es').includes(searchTerm));
  const visibleBusinesses = searchTerm
    ? sponsors.filter(matchesSearch).sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.order - b.order)
    : currentBusinesses;
  const activeCount = sponsors.filter((sponsor) => sponsor.active !== false).length;
  const categoriesInUse = availableCategories.filter((category) => sponsorsByCategory[category]?.length).length;

  const toggleActive = async (sponsor: SponsorItem) => {
    const next = { ...sponsor, active: !sponsor.active };
    setSponsors((items) => items.map((item) => item.id === sponsor.id ? next : item));
    try { await SponsorService.edit(sponsor.id, next); }
    catch {
      setSponsors((items) => items.map((item) => item.id === sponsor.id ? sponsor : item));
      toast({ status: 'error', title: 'No se pudo cambiar la visibilidad' });
    }
  };

  const requestDelete = (sponsor: SponsorItem) => { setPendingDelete(sponsor); onOpen(); };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await SponsorService.delete(pendingDelete.id);
      toast({ status: 'success', title: 'Patrocinador eliminado' });
      onClose();
      setPendingDelete(null);
      await load();
    } catch { toast({ status: 'error', title: 'No se pudo eliminar el patrocinador' }); }
  };

  const reorderSponsors = async (targetIndex: number, sponsorId = draggedSponsorId) => {
    if (!sponsorId || savingOrder || searchTerm) return;
    const fromIndex = currentBusinesses.findIndex((sponsor) => sponsor.id === sponsorId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    const nextSponsors = [...currentBusinesses];
    const [moved] = nextSponsors.splice(fromIndex, 1);
    nextSponsors.splice(Math.max(0, Math.min(targetIndex, nextSponsors.length)), 0, moved);
    const ordered = nextSponsors.map((sponsor, index) => ({ ...sponsor, order: index + 1 }));
    setSavingOrder(true);
    setSponsors((items) => [...items.filter((item) => item.category !== selectedCategory), ...ordered]);
    try {
      await Promise.all(ordered.map((sponsor) => SponsorService.edit(sponsor.id, sponsor)));
    } catch {
      toast({ status: 'error', title: 'No se pudo guardar el nuevo orden' });
      await load();
    } finally {
      setDraggedSponsorId('');
      setSavingOrder(false);
    }
  };

  const saveAvailableCopy = async () => {
    setSavingAvailableCopy(true);
    try {
      await SponsorDisplaySettingsService.save(availableCopy);
      toast({ status: 'success', title: 'Mensaje público actualizado' });
    } catch { toast({ status: 'error', title: 'No se pudo guardar el mensaje' }); }
    finally { setSavingAvailableCopy(false); }
  };

  return (
    <Box pt={{ base: '120px', md: '80px' }} pb="32px">
      <PageHeader
        title="Patrocinadores"
        description="Administrá la visibilidad y el orden de los comercios publicados."
        action={<Button as={RLink} to="/admin/sponsor/new" leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full">Nuevo patrocinador</Button>}
      />

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="12px" mb="18px">
        {[
          { label: 'Registrados', value: sponsors.length, icon: MdStorefront },
          { label: 'Visibles', value: activeCount, icon: MdVisibility },
          { label: 'Categorías en uso', value: categoriesInUse, icon: MdTune },
        ].map((stat) => <Card key={stat.label} p="16px" direction="row" align="center" gap="12px"><Center boxSize="42px" borderRadius="14px" bg="brand.50" color="brand.500"><Icon as={stat.icon} boxSize="22px" /></Center><Box><Text fontSize="xl" fontWeight="900" color={textColor}>{stat.value}</Text><Text fontSize="sm" color={muted}>{stat.label}</Text></Box></Card>)}
      </SimpleGrid>

      <Card p={{ base: '16px', md: '20px' }} mb="18px">
        <Flex align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap="14px">
          <Box flex="1" maxW={{ md: '520px' }}><Text fontWeight="900" color={textColor}>Filtrar por categoría</Text><Text color={muted} fontSize="sm" mb="9px">Seleccioná una categoría; el buscador superior filtra por nombre y descripción.</Text><Select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} size="lg" borderRadius="xl">{availableCategories.map((category) => <option key={category} value={category}>{category} · {sponsorsByCategory[category]?.length || 0}</option>)}</Select></Box>
          <HStack wrap="wrap"><Button variant="outline" leftIcon={<MdSettings />} onClick={categoryManager.onOpen}>Administrar categorías</Button>{savingOrder && <Badge colorScheme="brand">Guardando orden…</Badge>}{searchTerm && <Badge colorScheme="orange">Reordenamiento pausado</Badge>}</HStack>
        </Flex>
      </Card>

      {loading ? <AsyncContent isLoading loadingLabel="Cargando patrocinadores" /> : visibleBusinesses.length === 0 ? (
        <EmptyState icon={MdStorefront} title={searchTerm ? 'No hay coincidencias' : 'Esta categoría está vacía'} description={searchTerm ? 'Probá con otro nombre o limpiá la búsqueda superior.' : 'Usá “Nuevo patrocinador” para agregar el primero a esta categoría.'} />
      ) : (
        <Stack spacing="10px" mb="18px">
          {visibleBusinesses.map((sponsor) => {
            const categoryBusinesses = [...(sponsorsByCategory[sponsor.category] || [])].sort((a, b) => a.order - b.order || (a.name || '').localeCompare(b.name || ''));
            const position = categoryBusinesses.findIndex((item) => item.id === sponsor.id);
            return <Card key={sponsor.id} p={{ base: '14px', md: '16px' }} draggable={!searchTerm} cursor={!searchTerm ? 'grab' : 'default'} onDragStart={(event) => { event.dataTransfer.setData('text/plain', sponsor.id); setDraggedSponsorId(sponsor.id); }} onDragOver={(event) => { if (!searchTerm) event.preventDefault(); }} onDrop={(event) => { if (!searchTerm) { event.preventDefault(); reorderSponsors(position, event.dataTransfer.getData('text/plain') || draggedSponsorId); } }}>
              <Flex align={{ base: 'flex-start', md: 'center' }} gap="14px" direction={{ base: 'column', md: 'row' }}>
                <HStack flex="1" minW="0" align="center" spacing="12px">
                  <Center color={muted} flexShrink={0}><MdDragIndicator size="22px" /></Center>
                  <Center boxSize="58px" borderRadius="14px" bg={subtleBg} overflow="hidden" flexShrink={0}>{sponsor.logoUrl ? <Image src={sponsor.logoUrl} alt="" w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} color="gray.300" boxSize="26px" />}</Center>
                  <Box minW="0"><HStack flexWrap="wrap"><Text fontWeight="800" color={textColor} noOfLines={1}>{sponsor.name || 'Sin nombre'}</Text><Badge colorScheme={sponsor.active ? 'green' : 'gray'}>{sponsor.active ? 'Visible' : 'Oculto'}</Badge>{searchTerm && <Badge colorScheme="purple">{sponsor.category}</Badge>}</HStack><Text color={muted} fontSize="sm" noOfLines={1}>{sponsor.description || 'Sin descripción'}</Text><Text color={muted} fontSize="xs" mt="2px">Posición {position + 1}</Text></Box>
                </HStack>
                <HStack alignSelf={{ base: 'stretch', md: 'center' }} justify={{ base: 'space-between', md: 'flex-end' }}>
                  <FormControl display="flex" alignItems="center" w="auto"><Switch aria-label={`Visibilidad de ${sponsor.name || 'patrocinador'}`} isChecked={sponsor.active} onChange={() => toggleActive(sponsor)} /><FormLabel mb="0" ml="8px" fontSize="sm">Visible</FormLabel></FormControl>
                  <Button as={RLink} to={`/admin/sponsor/edit/${sponsor.id}`} size="sm" variant="ghost" leftIcon={<MdEdit />}>Editar</Button>
                  <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<MdDelete />} onClick={() => requestDelete(sponsor)}>Eliminar</Button>
                </HStack>
              </Flex>
            </Card>;
          })}
        </Stack>
      )}

      <Accordion allowToggle>
        <AccordionItem border="0">
          <Card overflow="hidden"><AccordionButton px={{ base: '14px', md: '18px' }} py="14px"><Box flex="1" textAlign="left"><Text fontWeight="800">Configuración del espacio disponible</Text><Text color={muted} fontSize="sm">Mensaje que se muestra cuando todavía no hay un patrocinador.</Text></Box><AccordionIcon /></AccordionButton><AccordionPanel px={{ base: '14px', md: '18px' }} pb="18px"><SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px"><FormControl><FormLabel>Título</FormLabel><Textarea value={availableCopy.availableTitle} onChange={(event) => setAvailableCopy((current) => ({ ...current, availableTitle: event.target.value }))} /></FormControl><FormControl><FormLabel>Descripción</FormLabel><Textarea value={availableCopy.availableDescription} onChange={(event) => setAvailableCopy((current) => ({ ...current, availableDescription: event.target.value }))} /></FormControl></SimpleGrid><Button mt="14px" colorScheme="brand" onClick={saveAvailableCopy} isLoading={savingAvailableCopy}>Guardar configuración</Button></AccordionPanel></Card>
        </AccordionItem>
      </Accordion>

      <CategoryManager kind="sponsors" categories={categories} isOpen={categoryManager.isOpen} onClose={categoryManager.onClose} onSaved={reloadCategories} />
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered><AlertDialogOverlay><AlertDialogContent><AlertDialogHeader>Eliminar patrocinador</AlertDialogHeader><AlertDialogBody>¿Querés eliminar a <b>{pendingDelete?.name || 'este patrocinador'}</b>? Esta acción no se puede deshacer.</AlertDialogBody><AlertDialogFooter><Button ref={cancelRef} onClick={onClose}>Cancelar</Button><Button colorScheme="red" ml={3} onClick={confirmDelete}>Eliminar</Button></AlertDialogFooter></AlertDialogContent></AlertDialogOverlay></AlertDialog>
    </Box>
  );
}
