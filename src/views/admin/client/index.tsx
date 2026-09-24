import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Badge, Box, Button, Center, Flex, FormControl, FormLabel, Icon,
  Input, InputGroup, InputLeftElement, SimpleGrid, Spinner, Switch, Text,
  useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdAdd, MdBadge, MdClose, MdEdit, MdPeople, MdPhone, MdSearch } from 'react-icons/md';
import Card from 'components/card/Card';
import ClientItem from 'interfaces/ClientItem';
import ClientService from 'services/ClientService';

const EMPTY_CLIENT: Omit<ClientItem, 'id'> = {
  nationalId: '', name: '', nickname: '', phone: '', active: true,
};

const getAddress = (client: ClientItem) => [
  client.address?.details,
  client.address?.district,
  client.address?.canton,
  client.address?.province,
].filter(Boolean).join(', ');

export default function Clients() {
  const toast = useToast();
  const mutedColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const toolbarBg = useColorModeValue('white', 'navy.800');
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ClientItem | null>(null);
  const [form, setForm] = useState<Omit<ClientItem, 'id'>>(EMPTY_CLIENT);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setClients(await ClientService.getAll()); }
    catch { toast({ status: 'error', title: 'No se pudieron cargar los clientes' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    if (!term) return clients;
    return clients.filter(client => [client.nationalId, client.name, client.nickname, client.phone, client.telefono]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(term)));
  }, [clients, query]);

  const activeClients = clients.filter(client => client.active !== false).length;
  const change = (name: keyof typeof form, value: any) => setForm(current => ({ ...current, [name]: value }));
  const closeForm = () => { setEditing(null); setForm(EMPTY_CLIENT); setShowForm(false); };
  const create = () => { setEditing(null); setForm(EMPTY_CLIENT); setShowForm(true); };
  const edit = (client: ClientItem) => {
    setEditing(client);
    setForm({
      nationalId: client.nationalId || '',
      name: client.name || '',
      nickname: client.nickname || '',
      phone: client.phone || client.telefono || '',
      active: client.active !== false,
      ...(client.address ? { address: client.address } : {}),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    if (!form.nationalId.trim() || !form.name.trim() || !form.phone.trim()) {
      toast({ status: 'warning', title: 'Completá la cédula, el nombre y el teléfono' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updatedClient = { ...editing, ...form };
        if (updatedClient.address === undefined) delete updatedClient.address;
        await ClientService.edit(editing.id, updatedClient);
      } else {
        await ClientService.create(form);
      }
      toast({ status: 'success', title: editing ? 'Cliente actualizado' : 'Cliente creado' });
      closeForm();
      await load();
    } catch {
      toast({ status: 'error', title: 'No se pudo guardar el cliente' });
    } finally { setSaving(false); }
  };

  return (
    <Box w="100%" pt={{ base: '110px', md: '80px' }} pb={8}>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} gap={4} direction={{ base: 'column', md: 'row' }}>
        <Box>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800">Clientes</Text>
          <Text color={mutedColor}>Gestioná la información y disponibilidad de tus clientes.</Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full" px={6} onClick={create}>
          Nuevo cliente
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={5} maxW="560px">
        <Card p={4} direction="row" align="center" gap={3}>
          <Center bg="brand.50" color="brand.500" boxSize="44px" borderRadius="xl"><Icon as={MdPeople} boxSize={6} /></Center>
          <Box><Text fontSize="2xl" fontWeight="800" lineHeight="1">{clients.length}</Text><Text fontSize="sm" color={mutedColor}>Clientes registrados</Text></Box>
        </Card>
        <Card p={4} direction="row" align="center" gap={3}>
          <Center bg="green.50" color="green.500" boxSize="44px" borderRadius="xl"><Box boxSize="10px" bg="green.400" borderRadius="full" /></Center>
          <Box><Text fontSize="2xl" fontWeight="800" lineHeight="1">{activeClients}</Text><Text fontSize="sm" color={mutedColor}>Clientes activos</Text></Box>
        </Card>
      </SimpleGrid>

      {showForm && (
        <Card p={{ base: 5, md: 6 }} mb={5} borderColor="brand.200">
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Text fontSize="lg" fontWeight="800">{editing ? 'Editar cliente' : 'Registrar cliente'}</Text>
              <Text fontSize="sm" color={mutedColor}>Los campos marcados son obligatorios.</Text>
            </Box>
            <Button leftIcon={<MdClose />} size="sm" variant="ghost" onClick={closeForm}>Cerrar</Button>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
            <FormControl isRequired><FormLabel>Cédula</FormLabel><Input placeholder="Ej. 1-2345-6789" value={form.nationalId} onChange={e => change('nationalId', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input placeholder="Nombre y apellidos" value={form.name} onChange={e => change('name', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Apodo</FormLabel><Input placeholder="Opcional" value={form.nickname || ''} onChange={e => change('nickname', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Teléfono</FormLabel><Input type="tel" placeholder="Ej. 8888-8888" value={form.phone} onChange={e => change('phone', e.target.value)} /></FormControl>
          </SimpleGrid>
          <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} mt={6} gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl display="flex" alignItems="center" w="auto"><Switch colorScheme="brand" isChecked={form.active !== false} onChange={e => change('active', e.target.checked)} /><FormLabel mb="0" ml={3}>Cliente activo</FormLabel></FormControl>
            <Flex gap={2}><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button colorScheme="brand" px={7} isLoading={saving} loadingText="Guardando" onClick={save}>{editing ? 'Guardar cambios' : 'Crear cliente'}</Button></Flex>
          </Flex>
        </Card>
      )}

      <Box bg={toolbarBg} borderRadius="2xl" p={{ base: 3, md: 4 }} mb={5} boxShadow="sm">
        <Flex align={{ base: 'stretch', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
          <InputGroup maxW={{ md: '520px' }}>
            <InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
            <Input aria-label="Buscar clientes" placeholder="Buscar por nombre, cédula, apodo o teléfono" value={query} onChange={e => setQuery(e.target.value)} />
          </InputGroup>
          <Text ml={{ md: 'auto' }} color={mutedColor} fontSize="sm">{visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}</Text>
        </Flex>
      </Box>

      {loading ? (
        <Center py={16}><Spinner size="xl" color="brand.500" /></Center>
      ) : visible.length === 0 ? (
        <Card py={14} align="center">
          <Center bg="secondaryGray.100" boxSize="56px" borderRadius="full" mb={3}><Icon as={MdPeople} boxSize={7} color="secondaryGray.500" /></Center>
          <Text fontWeight="700">{query ? 'No encontramos clientes' : 'Aún no hay clientes'}</Text>
          <Text color={mutedColor} fontSize="sm" textAlign="center" mt={1}>{query ? 'Probá con otro nombre, cédula o teléfono.' : 'Creá el primer cliente para comenzar.'}</Text>
          {!query && <Button mt={5} leftIcon={<MdAdd />} colorScheme="brand" onClick={create}>Nuevo cliente</Button>}
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {visible.map(client => {
            const address = getAddress(client);
            return (
              <Card key={client.id} p={5} _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all .2s ease">
                <Flex align="flex-start" gap={3}>
                  <Avatar name={client.name} size="md" bg="brand.500" color="white" />
                  <Box minW={0} flex="1">
                    <Flex align="center" gap={2}><Text fontWeight="800" noOfLines={1}>{client.name}</Text><Badge colorScheme={client.active === false ? 'gray' : 'green'} borderRadius="full">{client.active === false ? 'Inactivo' : 'Activo'}</Badge></Flex>
                    {client.nickname && <Text fontSize="sm" color={mutedColor} noOfLines={1}>“{client.nickname}”</Text>}
                  </Box>
                  <Button size="sm" variant="ghost" colorScheme="brand" leftIcon={<MdEdit />} onClick={() => edit(client)}>Editar</Button>
                </Flex>
                <Box borderTopWidth="1px" borderColor="blackAlpha.100" mt={4} pt={4}>
                  <Flex align="center" gap={2} mb={2}><Icon as={MdBadge} color={mutedColor} /><Text fontSize="sm">{client.nationalId}</Text></Flex>
                  <Flex align="center" gap={2}><Icon as={MdPhone} color={mutedColor} /><Text fontSize="sm">{client.phone || client.telefono}</Text></Flex>
                  {address && <Text fontSize="xs" color={mutedColor} mt={3} noOfLines={2}>{address}</Text>}
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
