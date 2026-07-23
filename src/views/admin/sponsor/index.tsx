// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdAddBusiness, MdDelete, MdDragIndicator, MdEdit } from 'react-icons/md';
import Card from 'components/card/Card';
import SponsorService from 'services/SponsorService';
import SponsorDisplaySettingsService, { defaultSponsorDisplaySettings } from 'services/SponsorDisplaySettingsService';
import AddButton from 'components/button/AddButton';
import SponsorStrip from 'views/public/SponsorStrip';

const SPONSOR_TYPES = ['VIP', 'Premium', 'General'];
const SPONSOR_CAPACITY = { VIP: 4, Premium: 8, General: 12 };

export default function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedType, setSelectedType] = useState('VIP');
  const [selectedSponsorId, setSelectedSponsorId] = useState('');
  const [draggedSponsorId, setDraggedSponsorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [availableCopy, setAvailableCopy] = useState(defaultSponsorDisplaySettings);
  const [savingAvailableCopy, setSavingAvailableCopy] = useState(false);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const dropBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const load = useCallback(() => {
    setLoading(true);

    return SponsorService.getAll()
      .then((data) => {
        setSponsors(data);

        setSelectedSponsorId((current) => {
          const activeOfType = data.filter(
            (sponsor) => sponsor.active !== false && sponsor.type === selectedType
          );

          return activeOfType.some((sponsor) => sponsor.id === current)
            ? current
            : activeOfType[0]?.id || '';
        });
      })
      .finally(() => setLoading(false));
  }, [selectedType]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { SponsorDisplaySettingsService.get().then(setAvailableCopy); }, []);

  const sponsorsByType = useMemo(() => SPONSOR_TYPES.reduce((acc, type) => ({
    ...acc,
    [type]: sponsors.filter((sponsor) => sponsor.type === type),
  }), {}), [sponsors]);

  const currentSponsors = [...(sponsorsByType[selectedType] || [])].sort((a, b) => a.order - b.order || (a.name || '').localeCompare(b.name || ''));
  const slotCount = Math.max(SPONSOR_CAPACITY[selectedType] || currentSponsors.length || 1, currentSponsors.length);
  const sponsorSlots = Array.from({ length: slotCount }, (_, index) => ({
    slot: index + 1,
    sponsor: currentSponsors[index] || null,
  }));
  const activeCurrentSponsors = currentSponsors.filter((sponsor) => sponsor.active !== false);
  const selectedSponsor = activeCurrentSponsors.find((sponsor) => sponsor.id === selectedSponsorId) || activeCurrentSponsors[0];

  const selectType = (index) => {
    const nextType = SPONSOR_TYPES[index];
    setSelectedType(nextType);
    const firstActive = (sponsorsByType[nextType] || []).find((sponsor) => sponsor.active !== false);
    setSelectedSponsorId(firstActive?.id || '');
  };

  const toggleActive = async (s) => {
    await SponsorService.edit(s.id, { ...s, active: !s.active });
    load();
  };

  const remove = async (id) => { await SponsorService.delete(id); load(); };

  const reorderSponsors = async (targetSlotIndex, sponsorId = draggedSponsorId) => {
    if (!sponsorId || savingOrder) return;

    const fromIndex = currentSponsors.findIndex((sponsor) => sponsor.id === sponsorId);
    if (fromIndex < 0) return;

    const nextSponsors = [...currentSponsors];
    const [moved] = nextSponsors.splice(fromIndex, 1);
    const safeTargetIndex = Math.max(0, Math.min(Number(targetSlotIndex) || 0, nextSponsors.length));
    nextSponsors.splice(safeTargetIndex, 0, moved);

    setSavingOrder(true);
    setSponsors((prev) => [
      ...prev.filter((sponsor) => sponsor.type !== selectedType),
      ...nextSponsors.map((sponsor, index) => ({ ...sponsor, order: index + 1, active: index < (SPONSOR_CAPACITY[selectedType] || 0) })),
    ].sort((a, b) => (a.type || '').localeCompare(b.type || '') || a.order - b.order || (a.name || '').localeCompare(b.name || '')));

    Promise.all(nextSponsors.map((sponsor, index) => SponsorService.edit(sponsor.id, {
      ...sponsor,
      order: index + 1,
      active: index < (SPONSOR_CAPACITY[selectedType] || 0),
    })))
      .catch(() => {})
      .finally(() => {
        setDraggedSponsorId('');
        setDropTargetIndex(null);
        setSavingOrder(false);
        load();
      });
  };

  const startDrag = (event, sponsorId) => {
    if (!sponsorId) return;
    // Firefox y algunos navegadores no inician el arrastre si dataTransfer no contiene datos.
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', sponsorId);
    setDraggedSponsorId(sponsorId);
  };

  const finishDrag = () => {
    setDraggedSponsorId('');
    setDropTargetIndex(null);
  };

  const saveAvailableCopy = async () => {
    setSavingAvailableCopy(true);
    try {
      await SponsorDisplaySettingsService.save(availableCopy);
      setAvailableCopy({
        availableTitle: availableCopy.availableTitle.trim() || defaultSponsorDisplaySettings.availableTitle,
        availableDescription: availableCopy.availableDescription.trim() || defaultSponsorDisplaySettings.availableDescription,
      });
    } finally {
      setSavingAvailableCopy(false);
    }
  };

  if (loading) return <Flex pt={{ base: '80px', md: '120px' }} justify="center"><Spinner size="xl" /></Flex>;

  return (
    <Box pt={{ base: '120px', md: '80px' }} px={{ base: '0px', md: '0px' }}>
      <Flex align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', sm: 'row' }} mb="20px" gap="12px">
        <Box flex="1" minW="0">
          <Text color={textColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800">Patrocinadores</Text>
          <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>Organizá los espacios por tipo, cambiá el orden con el mouse y previsualizá cómo se verán publicados.</Text>
        </Box>
        <Box alignSelf={{ base: 'flex-end', sm: 'center' }}><AddButton redirect="/admin/sponsor/new" /></Box>
      </Flex>

      <Tabs index={SPONSOR_TYPES.indexOf(selectedType)} onChange={selectType} colorScheme="brand" variant="soft-rounded">
        <Card p={{ base: '14px', md: '18px' }} mb="20px" overflow="hidden">
          <Stack spacing="16px">
            <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="12px" direction={{ base: 'column', md: 'row' }}>
              <Box>
                <Text color={textColor} fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Tipos de sponsor</Text>
                <Text color={muted} fontSize="sm">Seleccioná un tipo y arrastrá sus cards para definir la prioridad de aparición pública.</Text>
              </Box>
              {savingOrder && <Badge colorScheme="brand">Guardando orden...</Badge>}
            </Flex>

            <TabList overflowX="auto" pb="4px" gap="8px">
              {SPONSOR_TYPES.map((type) => (
                <Tab key={type} flexShrink={0} fontWeight="800">
                  {type}
                  <Badge ml="8px" colorScheme={type === 'VIP' ? 'yellow' : type === 'Premium' ? 'purple' : 'green'}>{sponsorsByType[type]?.length || 0}</Badge>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {SPONSOR_TYPES.map((type) => (
                <TabPanel key={type} px="0" pb="0">
                  <Stack spacing="8px">
                    <Text color={muted} fontSize="sm" fontWeight="700">Vista completa para el cliente</Text>
                    <SponsorStrip type={type} max={SPONSOR_CAPACITY[type]} sponsors={(sponsorsByType[type] || []).slice(0, SPONSOR_CAPACITY[type])} availableCopy={availableCopy} />
                  </Stack>
                </TabPanel>
              ))}
            </TabPanels>
          </Stack>
        </Card>
      </Tabs>

      <Card p={{ base: '14px', md: '18px' }} mb="20px">
        <Stack spacing="12px">
          <Box>
            <Text color={textColor} fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Texto de espacios disponibles</Text>
            <Text color={muted} fontSize="sm">Personalizá el mensaje que aparece en las tarjetas sin patrocinador de las páginas públicas.</Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
            <Box>
              <Text fontSize="sm" fontWeight="700" mb="6px">Título</Text>
              <Textarea value={availableCopy.availableTitle} onChange={(event) => setAvailableCopy((current) => ({ ...current, availableTitle: event.target.value }))} resize="vertical" minH="44px" />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="700" mb="6px">Descripción</Text>
              <Textarea value={availableCopy.availableDescription} onChange={(event) => setAvailableCopy((current) => ({ ...current, availableDescription: event.target.value }))} resize="vertical" minH="44px" />
            </Box>
          </SimpleGrid>
          <Button alignSelf="flex-start" colorScheme="brand" onClick={saveAvailableCopy} isLoading={savingAvailableCopy} loadingText="Guardando">Guardar texto</Button>
        </Stack>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: '12px', md: '18px' }}>
        {sponsorSlots.map(({ sponsor: s, slot }, index) => (
          <Card
            key={s?.id || `empty-${selectedType}-${slot}`}
            p={{ base: '14px', md: '18px' }}
            minW="0"
            minH={{ base: '230px', md: '260px' }}
            draggable={Boolean(s)}
            cursor={s ? 'grab' : 'default'}
            border="1px solid"
            borderColor={s && draggedSponsorId === s.id ? 'brand.300' : draggedSponsorId && dropTargetIndex === index ? 'brand.500' : s ? 'transparent' : 'brand.200'}
            borderStyle={s ? 'solid' : 'dashed'}
            bg={s && draggedSponsorId === s.id ? dropBg : undefined}
            onClick={() => s?.active !== false && s?.id && setSelectedSponsorId(s.id)}
            onDragStart={(event) => startDrag(event, s?.id)}
            onDragEnd={finishDrag}
            onDragEnter={(event) => { event.preventDefault(); if (draggedSponsorId) setDropTargetIndex(index); }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
            onDrop={(event) => { event.preventDefault(); const sponsorId = draggedSponsorId || event.dataTransfer.getData('text/plain'); if (sponsorId) setDraggedSponsorId(sponsorId); reorderSponsors(index, sponsorId); }}
          >
            {s ? (
              <Stack spacing="12px" h="100%">
                <Flex align="center" justify="space-between" gap="10px">
                  <HStack spacing="8px" minW="0">
                    <IconButton aria-label="Arrastrar para ordenar" icon={<MdDragIndicator />} size="sm" variant="ghost" cursor="grab" pointerEvents="none" />
                    <Badge colorScheme="brand">Posición #{slot}</Badge>
                    <Badge colorScheme={s.type === 'VIP' ? 'yellow' : s.type === 'Premium' ? 'purple' : 'green'}>{s.type}</Badge>
                  </HStack>
                  <Badge colorScheme={slot > SPONSOR_CAPACITY[selectedType] ? 'orange' : s.active ? 'green' : 'gray'}>{slot > SPONSOR_CAPACITY[selectedType] ? 'Excede el límite' : s.active ? 'Activo' : 'Oculto'}</Badge>
                </Flex>
                {s.logoUrl ? <Image src={s.logoUrl} alt={s.name || 'Sponsor'} h={{ base: '72px', md: '92px' }} objectFit="contain" /> : <Box h={{ base: '72px', md: '92px' }} bg="gray.100" borderRadius="16px" />}
                <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }} noOfLines={2}>{s.name || 'Sin título'}</Text>
                {s.description && <Text color="gray.500" noOfLines={2} fontSize="sm">{s.description}</Text>}
                <Box flex="1" />
                <HStack justify="space-between"><Text>{slot > SPONSOR_CAPACITY[selectedType] ? 'Inactivo por límite' : 'Activo'}</Text><Switch isChecked={s.active} isDisabled={slot > SPONSOR_CAPACITY[selectedType]} onChange={() => toggleActive(s)} /></HStack>
                <HStack justify="flex-end">
                  <IconButton aria-label="Editar" icon={<MdEdit />} as={RLink} to={`/admin/sponsor/edit/${s.id}`} />
                  <IconButton aria-label="Eliminar" icon={<MdDelete />} onClick={() => remove(s.id)} />
                </HStack>
              </Stack>
            ) : (
              <Stack h="100%" align="center" justify="center" textAlign="center" spacing="10px" color={muted}>
                <Box w="56px" h="56px" borderRadius="full" bg="brand.50" color="brand.500" display="flex" alignItems="center" justifyContent="center">
                  <MdAddBusiness size="28px" />
                </Box>
                <Badge colorScheme="brand">Posición #{slot}</Badge>
                <Text fontWeight="800" color={textColor}>Espacio disponible</Text>
                <Text fontSize="sm">Arrastrá un patrocinador aquí para asignarlo a esta posición.</Text>
              </Stack>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
