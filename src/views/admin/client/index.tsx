import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, SimpleGrid, Spinner,
  Switch, Text, useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import ClientItem from 'interfaces/ClientItem';
import ClientService from 'services/ClientService';

const EMPTY_CLIENT: Omit<ClientItem, 'id'> = { nationalId: '', name: '', nickname: '', phone: '', active: true };

export default function Clients() {
  const toast = useToast();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ClientItem | null>(null);
  const [form, setForm] = useState<Omit<ClientItem, 'id'>>(EMPTY_CLIENT);
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

  const change = (name: keyof typeof form, value: any) => setForm(current => ({ ...current, [name]: value }));
  const reset = () => { setEditing(null); setForm(EMPTY_CLIENT); };
  const edit = (client: ClientItem) => {
    setEditing(client);
    setForm({ nationalId: client.nationalId || '', name: client.name || '', nickname: client.nickname || '', phone: client.phone || client.telefono || '', active: client.active !== false, address: client.address });
  };
  const save = async () => {
    if (!form.nationalId.trim() || !form.name.trim() || !form.phone.trim()) {
      toast({ status: 'warning', title: 'Cédula, nombre y teléfono son obligatorios' }); return;
    }
    setSaving(true);
    try {
      if (editing) await ClientService.edit(editing.id, { ...editing, ...form });
      else await ClientService.create(form);
      toast({ status: 'success', title: editing ? 'Cliente actualizado' : 'Cliente creado' });
      reset(); await load();
    } catch { toast({ status: 'error', title: 'No se pudo guardar el cliente' }); }
    finally { setSaving(false); }
  };

  return <Box w="100%" pt={{ base: '90px', md: '70px' }}>
    <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
      <Box><Text fontSize="2xl" fontWeight="800">Clientes</Text><Text color="gray.500">Administración y búsqueda del directorio</Text></Box>
      <Input maxW="420px" bg="white" placeholder="Buscar por cédula, nombre, apodo o teléfono" value={query} onChange={e => setQuery(e.target.value)} />
    </Flex>
    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} alignItems="start">
      <Card p={5}>
        <Text fontWeight="800" mb={4}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</Text>
        <FormControl isRequired mb={3}><FormLabel>Cédula</FormLabel><Input value={form.nationalId} onChange={e => change('nationalId', e.target.value)} /></FormControl>
        <FormControl isRequired mb={3}><FormLabel>Nombre</FormLabel><Input value={form.name} onChange={e => change('name', e.target.value)} /></FormControl>
        <FormControl mb={3}><FormLabel>Apodo</FormLabel><Input value={form.nickname || ''} onChange={e => change('nickname', e.target.value)} /></FormControl>
        <FormControl isRequired mb={3}><FormLabel>Teléfono</FormLabel><Input value={form.phone} onChange={e => change('phone', e.target.value)} /></FormControl>
        <FormControl display="flex" alignItems="center" mb={4}><FormLabel mb="0">Activo</FormLabel><Switch isChecked={form.active !== false} onChange={e => change('active', e.target.checked)} /></FormControl>
        <Flex gap={2}><Button colorScheme="brand" isLoading={saving} onClick={save}>Guardar</Button>{editing && <Button onClick={reset}>Cancelar</Button>}</Flex>
      </Card>
      <Box gridColumn={{ lg: 'span 2' }}>
        {loading ? <Spinner /> : visible.length === 0 ? <Card p={6}><Text>No se encontraron clientes.</Text></Card> :
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>{visible.map(client =>
            <Card p={4} key={client.id}><Flex justify="space-between" gap={3}><Box minW={0}><Text fontWeight="800" noOfLines={1}>{client.name}</Text><Text fontSize="sm">Cédula: {client.nationalId}</Text><Text fontSize="sm">Teléfono: {client.phone || client.telefono}</Text>{client.nickname && <Text fontSize="sm" color="gray.500">Apodo: {client.nickname}</Text>}</Box><Button size="sm" onClick={() => edit(client)}>Editar</Button></Flex></Card>)}</SimpleGrid>}
      </Box>
    </SimpleGrid>
  </Box>;
}
