import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Badge, Box, Button, Center, Flex, FormControl, FormLabel, Icon, IconButton,
  Input, SimpleGrid, Switch, Text, Tooltip,
  useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdAdd, MdBadge, MdEdit, MdLocationOn, MdPeople, MdPhone } from 'react-icons/md';
import Card from 'components/card/Card';
import ClientItem from 'interfaces/ClientItem';
import ClientService from 'services/ClientService';
import { usePageSearch } from 'contexts/PageSearchContext';
import PageHeader from 'components/layout/PageHeader';
import FormPanel from 'components/form/FormPanel';
import EmptyState from 'components/dataDisplay/EmptyState';
import AsyncContent from 'components/dataDisplay/AsyncContent';

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
  const { query } = usePageSearch();
  const [clients, setClients] = useState<ClientItem[]>([]);
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
      <PageHeader
        title="Clientes"
        description="Gestioná la información y disponibilidad de tus clientes."
        action={<Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full" px={6} onClick={create}>Nuevo cliente</Button>}
      />

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
        <FormPanel title={editing ? 'Editar cliente' : 'Registrar cliente'} description="Los campos marcados son obligatorios." onClose={closeForm} footer={
          <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl display="flex" alignItems="center" w="auto"><Switch colorScheme="brand" isChecked={form.active !== false} onChange={e => change('active', e.target.checked)} /><FormLabel mb="0" ml={3}>Cliente activo</FormLabel></FormControl>
            <Flex gap={2}><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button colorScheme="brand" px={7} isLoading={saving} loadingText="Guardando" onClick={save}>{editing ? 'Guardar cambios' : 'Crear cliente'}</Button></Flex>
          </Flex>
        }>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
            <FormControl isRequired><FormLabel>Cédula</FormLabel><Input placeholder="Ej. 1-2345-6789" value={form.nationalId} onChange={e => change('nationalId', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input placeholder="Nombre y apellidos" value={form.name} onChange={e => change('name', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Apodo</FormLabel><Input placeholder="Opcional" value={form.nickname || ''} onChange={e => change('nickname', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Teléfono</FormLabel><Input type="tel" placeholder="Ej. 8888-8888" value={form.phone} onChange={e => change('phone', e.target.value)} /></FormControl>
          </SimpleGrid>
        </FormPanel>
      )}

      <Text mb={5} textAlign="right" color={mutedColor} fontSize="sm">{visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}</Text>

      {loading ? (
        <AsyncContent isLoading loadingLabel="Cargando clientes" />
      ) : visible.length === 0 ? (
        <EmptyState icon={MdPeople} title={query ? 'No encontramos clientes' : 'Aún no hay clientes'} description={query ? 'Probá con otro nombre, cédula o teléfono.' : 'Creá el primer cliente para comenzar.'} actionLabel={!query ? 'Nuevo cliente' : undefined} actionIcon={<MdAdd />} onAction={!query ? create : undefined} />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2, '2xl': 3 }} spacing={4}>
          {visible.map(client => {
            const address = getAddress(client);
            return (
              <Card key={client.id} p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="blackAlpha.50" _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: 'brand.100' }} transition="all .2s ease">
                <Flex align="flex-start" gap={3}>
                  <Avatar name={client.name} size="md" bg="brand.500" color="white" flexShrink={0} />
                  <Box minW={0} flex="1" pt="2px">
                    <Text fontWeight="800" fontSize="lg" lineHeight="1.25" wordBreak="break-word">{client.name}</Text>
                    <Flex mt="6px" align="center" gap="7px" flexWrap="wrap">
                      <Badge colorScheme={client.active === false ? 'gray' : 'green'} borderRadius="full" px="9px">{client.active === false ? 'Inactivo' : 'Activo'}</Badge>
                      {client.nickname && <Text fontSize="sm" color={mutedColor}>“{client.nickname}”</Text>}
                    </Flex>
                  </Box>
                  <Tooltip label="Editar cliente" hasArrow>
                    <IconButton aria-label={`Editar ${client.name}`} size="sm" variant="ghost" colorScheme="brand" borderRadius="full" icon={<MdEdit />} onClick={() => edit(client)} flexShrink={0} />
                  </Tooltip>
                </Flex>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="10px" borderTopWidth="1px" borderColor="blackAlpha.100" mt={4} pt={4}>
                  <Flex align="center" gap="10px" minW={0}><Center boxSize="34px" borderRadius="lg" bg="brand.50" color="brand.500" flexShrink={0}><Icon as={MdBadge} /></Center><Box minW={0}><Text fontSize="xs" color={mutedColor}>Cédula</Text><Text fontSize="sm" fontWeight="700" wordBreak="break-word">{client.nationalId}</Text></Box></Flex>
                  <Flex align="center" gap="10px" minW={0}><Center boxSize="34px" borderRadius="lg" bg="brand.50" color="brand.500" flexShrink={0}><Icon as={MdPhone} /></Center><Box minW={0}><Text fontSize="xs" color={mutedColor}>Teléfono</Text><Text fontSize="sm" fontWeight="700">{client.phone || client.telefono}</Text></Box></Flex>
                </SimpleGrid>
                {address && <Flex align="flex-start" gap="8px" mt={4} p="10px" borderRadius="xl" bg="blackAlpha.50"><Icon as={MdLocationOn} color={mutedColor} mt="2px" flexShrink={0} /><Text fontSize="xs" color={mutedColor} lineHeight="1.5">{address}</Text></Flex>}
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
