// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Badge, Box, Flex, HStack, IconButton, Image, SimpleGrid, Spinner, Stack, Switch, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';
import Card from 'components/card/Card';
import SponsorService from 'services/SponsorService';
import AddButton from 'components/button/AddButton';

export default function SponsorsAdmin() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const textColor = useColorModeValue('navy.700', 'white');

  const load = () => SponsorService.getAll().then(setSponsors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (s) => {
    await SponsorService.edit(s.id, { ...s, active: !s.active });
    load();
  };

  const remove = async (id) => { await SponsorService.delete(id); load(); };

  if (loading) return <Flex pt={{ base: '80px', md: '120px' }} justify="center"><Spinner size="xl" /></Flex>;

  return (
    <Box pt={{ base: '120px', md: '80px' }} px={{ base: '0px', md: '0px' }}>
      <Flex align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', sm: 'row' }} mb="20px" gap="12px">
        <Box flex="1" minW="0"><Text color={textColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800">Patrocinadores</Text><Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>Crear, editar, activar, ordenar y previsualizar espacios VIP, Premium y General.</Text></Box>
        <Box alignSelf={{ base: 'flex-end', sm: 'center' }}><AddButton redirect="/admin/sponsor/new" /></Box>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: '12px', md: '18px' }}>
        {sponsors.map((s) => (
          <Card key={s.id} p={{ base: '14px', md: '18px' }} minW="0">
            <Stack spacing="12px">
              {s.logoUrl ? <Image src={s.logoUrl} alt={s.name} h={{ base: '82px', md: '100px' }} objectFit="contain" /> : <Box h={{ base: '82px', md: '100px' }} bg="gray.100" borderRadius="16px" />}
              <HStack flexWrap="wrap"><Badge colorScheme={s.type === 'VIP' ? 'yellow' : s.type === 'Premium' ? 'purple' : 'green'}>{s.type}</Badge><Badge colorScheme={s.active ? 'green' : 'gray'}>{s.active ? 'Disponible en tabs' : 'Oculto'}</Badge></HStack>
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
