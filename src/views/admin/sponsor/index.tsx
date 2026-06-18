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

  if (loading) return <Flex pt="120px" justify="center"><Spinner size="xl" /></Flex>;

  return (
    <Box pt={{ base: '180px', md: '80px' }}>
      <Flex align="center" mb="20px" gap="12px">
        <Box><Text color={textColor} fontSize="2xl" fontWeight="800">Patrocinadores</Text><Text color="gray.500">Crear, editar, activar, ordenar y previsualizar espacios VIP, Premium y General.</Text></Box>
        <Box ml="auto"><AddButton redirect="/admin/sponsor/new" /></Box>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="18px">
        {sponsors.map((s) => (
          <Card key={s.id} p="18px">
            <Stack spacing="12px">
              {s.logoUrl ? <Image src={s.logoUrl} alt={s.name} h="100px" objectFit="contain" /> : <Box h="100px" bg="gray.100" borderRadius="16px" />}
              <HStack><Badge colorScheme={s.type === 'VIP' ? 'yellow' : s.type === 'Premium' ? 'purple' : 'green'}>{s.type}</Badge><Badge>Orden {s.order}</Badge></HStack>
              <Text fontWeight="800" fontSize="lg">{s.name}</Text>
              <Text color="gray.500" noOfLines={2}>{s.description || 'Sin descripción'}</Text>
              <HStack><Text>Activo</Text><Switch isChecked={s.active} onChange={() => toggleActive(s)} /></HStack>
              <HStack>
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
