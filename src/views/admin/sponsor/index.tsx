import { sponsorCategories, hasSponsorCategory } from 'utils/sponsorCategories';
import { sortCategories } from 'utils/categories';
import { normalizeBusinessName } from 'utils/businessName';
import {
Badge, Box, Button, Center, Flex, HStack, Icon, Image,
Select, SimpleGrid, Stack, Switch, Text,
useColorModeValue, useDisclosure, useToast
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import EmptyState from 'components/dataDisplay/EmptyState';
import FormField from 'components/form/FormField';
import PageHeader from 'components/layout/PageHeader';
import DeleteModal from 'components/modal/DeleteModal';
import { usePageSearch } from 'contexts/PageSearchContext';
import useCategories from 'hooks/useCategories';
import SponsorItem from 'interfaces/SponsorItem';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDelete, MdEdit, MdSettings, MdStorefront, MdTune, MdVisibility } from 'react-icons/md';
import { Link as RLink } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import TableExport from 'components/dataDisplay/TableExport';
import PromotionRequests from './PromotionRequests';
import { sponsorLinks } from 'utils/sponsor';

const columns = ['Negocio', 'Categorías', 'Estado', 'Descripción', 'Contacto y redes', 'Ubicación', 'Google Maps', 'Waze', 'Indicaciones', 'Video'];


export default function SponsorsAdmin() {
  const { query } = usePageSearch();
  const { categories } = useCategories('sponsors');
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SponsorItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleting, setDeleting] = useState(false);
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

  const availableCategories = useMemo(() => sortCategories([...categories, ...sponsors.flatMap(sponsorCategories)]), [categories, sponsors]);
  const sponsorsByCategory = useMemo(() => availableCategories.reduce<Record<string, SponsorItem[]>>((acc, type) => ({
    ...acc,
    [type]: sponsors.filter((sponsor) => hasSponsorCategory(sponsor, type)),
  }), {}), [availableCategories, sponsors]);

  const searchTerm = query.trim().toLocaleLowerCase('es');
  const visibleBusinesses = (selectedCategory ? sponsorsByCategory[selectedCategory] || [] : sponsors)
    .filter(sponsor => !searchTerm || [sponsor.name, sponsor.description, ...sponsorCategories(sponsor)]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(searchTerm)));
  const exportRows = (split: boolean) => visibleBusinesses.flatMap(sponsor => {
    const categories = sponsorCategories(sponsor);
    const cells = [
      sponsor.active ? 'Visible' : 'Oculto', sponsor.description || '', sponsorLinks(sponsor).join(' | '),
      sponsor.coordinates || '', sponsor.mapsUrl || '', sponsor.wazeUrl || '', sponsor.directions || '',
      sponsor.videoUrl?.startsWith('data:') ? 'Video adjunto' : sponsor.videoUrl || '',
    ];
    const categoryCells = split && categories.length ? categories : [categories.join(' | ')];
    return categoryCells.map(category => [sponsor.name, category, ...cells]);
  });
  const activeCount = sponsors.filter((sponsor) => sponsor.active !== false).length;
  const categoriesInUse = availableCategories.filter((category) => sponsorsByCategory[category]?.length).length;

  const toggleActive = async (sponsor: SponsorItem) => {
    if (!normalizeBusinessName(sponsor.name)) {
      toast({ status: 'error', title: 'Complete el nombre del negocio', description: 'Edite el patrocinador y agregue su nombre antes de cambiar la visibilidad.' });
      return;
    }
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
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await SponsorService.delete(pendingDelete.id);
      toast({ status: 'success', title: 'Patrocinador eliminado' });
      onClose();
      setPendingDelete(null);
      await load();
    } catch { toast({ status: 'error', title: 'No se pudo eliminar el patrocinador' }); }
    finally { setDeleting(false); }
  };

  return (
    <Box pt={{ base: '120px', md: '80px' }} pb="32px">
      <PageHeader
        title="Patrocinadores"
        description="Administrá la visibilidad y el orden de los comercios publicados."
        action={<Flex gap={2} wrap="wrap">
          <Button as={RLink} to="/admin/sponsor/new" leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full">Nuevo patrocinador</Button>
          <PromotionRequests />
          <TableExport filename="Comercios" columns={columns} matched={visibleBusinesses.length} rows={exportRows} categoryOptions disabled={loading}
            scope={`${selectedCategory ? 'Categoría ' + selectedCategory : 'Todas las categorías'}${searchTerm ? ' · Búsqueda «' + query.trim() + '»' : ''}`} />
        </Flex>}
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
          <Box flex="1" maxW={{ md: '520px' }}><Text fontWeight="900" color={textColor}>Filtrar por categoría</Text><Text color={muted} fontSize="sm" mb="9px">La categoría y la búsqueda superior se aplican juntas.</Text><Select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} size="lg" borderRadius="xl"><option value="">Todas las categorías</option>{availableCategories.map((category) => <option key={category} value={category}>{category} · {sponsorsByCategory[category]?.length || 0}</option>)}</Select></Box>
          <HStack wrap="wrap"><Button variant="outline" leftIcon={<MdSettings />} as={RLink} to="/admin/sponsor/categories">Administrar categorías</Button><Button variant="outline" as={RLink} to="/admin/sponsor/order">Orden de la vista pública</Button></HStack>
        </Flex>
      </Card>

      {loading ? <AsyncContent isLoading loadingLabel="Cargando patrocinadores" /> : visibleBusinesses.length === 0 ? (
        <EmptyState icon={MdStorefront} title={searchTerm ? 'No hay coincidencias' : 'Esta categoría está vacía'} description={searchTerm ? 'Probá con otro nombre o limpiá la búsqueda superior.' : 'Usá “Nuevo patrocinador” para agregar el primero a esta categoría.'} />
      ) : (
        <Stack spacing="10px" mb="18px">
          {visibleBusinesses.map(sponsor => (
            <Card key={sponsor.id} p={{ base: '14px', md: '16px' }}>
              <Flex align={{ base: 'flex-start', md: 'center' }} gap="14px" direction={{ base: 'column', md: 'row' }}>
                <HStack flex="1" minW="0" align="center" spacing="12px">
                  <Center boxSize="58px" borderRadius="14px" bg={subtleBg} overflow="hidden" flexShrink={0}>{sponsor.logoUrl ? <Image src={sponsor.logoUrl} alt="" w="100%" h="100%" objectFit="contain" /> : <Icon as={MdStorefront} color="gray.300" boxSize="26px" />}</Center>
                  <Box minW="0"><HStack flexWrap="wrap"><Text fontWeight="800" color={textColor} noOfLines={1}>{sponsor.name || 'Sin nombre'}</Text><Badge colorScheme={sponsor.active ? 'green' : 'gray'}>{sponsor.active ? 'Visible' : 'Oculto'}</Badge>{sponsorCategories(sponsor).map(category => <Badge key={category} colorScheme="purple">{category}</Badge>)}</HStack><Text color={muted} fontSize="sm" noOfLines={1}>{sponsor.description || 'Sin descripción'}</Text></Box>
                </HStack>
                <HStack alignSelf={{ base: 'stretch', md: 'center' }} justify={{ base: 'space-between', md: 'flex-end' }}>
                  <FormField display="flex" alignItems="center" w="auto" label={<>Visible</>}><Switch aria-label={`Visibilidad de ${sponsor.name || 'patrocinador'}`} isChecked={sponsor.active} onChange={() => toggleActive(sponsor)} /></FormField>
                  <Button as={RLink} to={`/admin/sponsor/edit/${sponsor.id}`} size="sm" variant="ghost" leftIcon={<MdEdit />}>Editar</Button>
                  <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<MdDelete />} onClick={() => requestDelete(sponsor)}>Eliminar</Button>
                </HStack>
              </Flex>
            </Card>
          ))}
        </Stack>
      )}



      <DeleteModal title="Eliminar patrocinador" isOpen={isOpen} onClose={onClose} handle={confirmDelete} isLoading={deleting}
        message={<>¿Querés eliminar a <b>{pendingDelete?.name || 'este patrocinador'}</b>? Esta acción no se puede deshacer.</>} />
    </Box>
  );
}
