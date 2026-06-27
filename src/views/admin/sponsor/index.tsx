// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, HStack, IconButton, Image, SimpleGrid, Spinner, Stack, Switch, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';
import Card from 'components/card/Card';
import SponsorService from 'services/SponsorService';
import AddButton from 'components/button/AddButton';
import SponsorStrip from 'views/public/SponsorStrip';

export default function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState('');
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const tabBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const activeTabBg = useColorModeValue('brand.500', 'brand.300');

  const load = () => SponsorService.getAll().then((data) => {
    setSponsors(data);
    setSelectedSponsorId((current) => {
      const activeSponsors = data.filter((sponsor) => sponsor.active !== false);
      return activeSponsors.some((sponsor) => sponsor.id === current) ? current : activeSponsors[0]?.id || '';
    });
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const activeSponsors = useMemo(() => sponsors.filter((sponsor) => sponsor.active !== false), [sponsors]);
  const selectedSponsor = activeSponsors.find((sponsor) => sponsor.id === selectedSponsorId) || activeSponsors[0];

  const toggleActive = async (s) => {
    await SponsorService.edit(s.id, { ...s, active: !s.active });
    load();
  };

  const remove = async (id) => { await SponsorService.delete(id); load(); };

  if (loading) return <Flex pt={{ base: '80px', md: '120px' }} justify="center"><Spinner size="xl" /></Flex>;

  return (
    <Box pt={{ base: '120px', md: '80px' }} px={{ base: '0px', md: '0px' }}>
      <Flex align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', sm: 'row' }} mb="20px" gap="12px">
        <Box flex="1" minW="0"><Text color={textColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800">Patrocinadores</Text><Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>Crear, editar, activar y previsualizar espacios VIP, Premium y General.</Text></Box>
        <Box alignSelf={{ base: 'flex-end', sm: 'center' }}><AddButton redirect="/admin/sponsor/new" /></Box>
      </Flex>

      <Card p={{ base: '14px', md: '18px' }} mb="20px" overflow="hidden">
        <Stack spacing="14px">
          <Box>
            <Text color={textColor} fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Pestañas de patrocinadores disponibles</Text>
            <Text color={muted} fontSize="sm">Solo aparecen patrocinadores activos. Al desactivar uno, desaparece de estas pestañas pero permanece en la lista para poder reactivarlo.</Text>
          </Box>
          {activeSponsors.length ? (
            <>
              <HStack spacing="10px" overflowX="auto" pb="4px">
                {activeSponsors.map((sponsor) => {
                  const isSelected = sponsor.id === selectedSponsor?.id;
                  return (
                    <Button
                      key={sponsor.id}
                      onClick={() => setSelectedSponsorId(sponsor.id)}
                      size="sm"
                      borderRadius="full"
                      flexShrink={0}
                      bg={isSelected ? activeTabBg : tabBg}
                      color={isSelected ? 'white' : muted}
                      _hover={{ bg: isSelected ? activeTabBg : 'gray.200' }}
                    >
                      {sponsor.name}
                    </Button>
                  );
                })}
              </HStack>
              {selectedSponsor && <SponsorStrip type={selectedSponsor.type} max={1} title="Previsualización del patrocinador seleccionado" previewSponsor={{ ...selectedSponsor, active: true }} />}
            </>
          ) : (
            <Text color={muted} fontSize="sm">No hay patrocinadores activos para mostrar como pestañas.</Text>
          )}
        </Stack>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: '12px', md: '18px' }}>
        {sponsors.map((s) => (
          <Card key={s.id} p={{ base: '14px', md: '18px' }} minW="0">
            <Stack spacing="12px">
              {s.logoUrl ? <Image src={s.logoUrl} alt={s.name} h={{ base: '82px', md: '100px' }} objectFit="contain" /> : <Box h={{ base: '82px', md: '100px' }} bg="gray.100" borderRadius="16px" />}
              <HStack flexWrap="wrap"><Badge colorScheme={s.type === 'VIP' ? 'yellow' : s.type === 'Premium' ? 'purple' : 'green'}>{s.type}</Badge><Badge colorScheme={s.active ? 'green' : 'gray'}>{s.active ? 'Disponible en pestañas' : 'Oculto'}</Badge></HStack>
              <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }} noOfLines={2}>{s.name}</Text>
              <Text color="gray.500" noOfLines={2} fontSize="sm">{s.description || 'Sin descripción'}</Text>
              <HStack justify="space-between"><Text>Activo</Text><Switch isChecked={s.active} onChange={() => toggleActive(s)} /></HStack>
              <HStack justify="flex-end">
                <IconButton aria-label="Editar" icon={<MdEdit />} as={RLink} to={`/admin/sponsor/edit/${s.id}`} />
                <IconButton aria-label="Eliminar" icon={<MdDelete />} onClick={() => remove(s.id)} />
              </HStack>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
