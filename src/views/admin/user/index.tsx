import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Badge, Box, Button, Center, Flex, FormControl, FormHelperText,
  FormLabel, Icon, Input, InputGroup, InputLeftElement, SimpleGrid, Spinner,
  Switch, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdAdd, MdClose, MdEdit, MdManageAccounts, MdSearch } from 'react-icons/md';
import Card from 'components/card/Card';
import UserItem from 'interfaces/UserItem';
import UserService from 'services/UserService';

type FormState = { name: string; email: string; password: string; active: boolean };
const EMPTY_FORM: FormState = { name: '', email: '', password: '', active: true };

export default function Users() {
  const toast = useToast();
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const surface = useColorModeValue('white', 'navy.800');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await UserService.getAll();
      setUsers(all.filter(user => user.roles?.includes('colaborador')));
    } catch {
      toast({ status: 'error', title: 'No se pudieron cargar los colaboradores' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    if (!term) return users;
    return users.filter(user => [user.name, user.email]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(term)));
  }, [query, users]);

  const close = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (user: UserItem) => {
    setEditing(user);
    setForm({ name: user.name || '', email: user.email || '', password: '', active: user.active !== false });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const change = (field: keyof FormState, value: string | boolean) =>
    setForm(current => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.name.trim() || (!editing && !form.email.trim())) {
      toast({ status: 'warning', title: 'Completá los campos obligatorios' });
      return;
    }
    if (!editing && form.password.length < 6) {
      toast({ status: 'warning', title: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (!editing && users.some(user => user.email?.toLowerCase() === form.email.trim().toLowerCase())) {
      toast({ status: 'warning', title: 'Ya existe un colaborador con ese correo' });
      return;
    }
    setSaving(true);
    try {
      if (editing) await UserService.updateCollaborator(editing.id, { name: form.name, active: form.active });
      else await UserService.createCollaborator(form);
      toast({ status: 'success', title: editing ? 'Colaborador actualizado' : 'Colaborador agregado' });
      close();
      await load();
    } catch (error) {
      const message = error instanceof Error && error.message.includes('email-already-in-use')
        ? 'Ese correo ya está registrado' : 'No se pudo guardar el colaborador';
      toast({ status: 'error', title: message });
    } finally { setSaving(false); }
  };

  return (
    <Box w="100%" pt={{ base: '110px', md: '80px' }} pb={8}>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4} mb={6} direction={{ base: 'column', md: 'row' }}>
        <Box>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800">Colaboradores</Text>
          <Text color={muted}>Agregá y administrá el acceso de tu equipo.</Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full" px={6} onClick={openCreate}>Agregar colaborador</Button>
      </Flex>

      {showForm && (
        <Card p={{ base: 5, md: 6 }} mb={5} borderColor="brand.200">
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Text fontSize="lg" fontWeight="800">{editing ? 'Editar colaborador' : 'Nuevo colaborador'}</Text>
              <Text fontSize="sm" color={muted}>{editing ? 'Actualizá su nombre o acceso.' : 'Creá sus credenciales de acceso.'}</Text>
            </Box>
            <Button aria-label="Cerrar formulario" leftIcon={<MdClose />} size="sm" variant="ghost" onClick={close}>Cerrar</Button>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: editing ? 2 : 3 }} spacing={4}>
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input autoComplete="name" value={form.name} onChange={event => change('name', event.target.value)} /></FormControl>
            <FormControl isRequired isDisabled={Boolean(editing)}><FormLabel>Correo electrónico</FormLabel><Input type="email" autoComplete="email" value={form.email} onChange={event => change('email', event.target.value)} /></FormControl>
            {!editing && <FormControl isRequired><FormLabel>Contraseña temporal</FormLabel><Input type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={event => change('password', event.target.value)} /><FormHelperText>Al menos 6 caracteres.</FormHelperText></FormControl>}
          </SimpleGrid>
          <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} mt={6} gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl display="flex" alignItems="center" w="auto"><Switch colorScheme="brand" isChecked={form.active} onChange={event => change('active', event.target.checked)} /><FormLabel mb="0" ml={3}>Acceso activo</FormLabel></FormControl>
            <Flex gap={2}><Button variant="ghost" onClick={close}>Cancelar</Button><Button colorScheme="brand" px={7} isLoading={saving} loadingText="Guardando" onClick={save}>{editing ? 'Guardar cambios' : 'Crear acceso'}</Button></Flex>
          </Flex>
        </Card>
      )}

      <Box bg={surface} borderRadius="2xl" p={{ base: 3, md: 4 }} mb={5} boxShadow="sm">
        <Flex align={{ base: 'stretch', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
          <InputGroup maxW={{ md: '520px' }}><InputLeftElement pointerEvents="none"><Icon as={MdSearch} color="gray.400" /></InputLeftElement><Input aria-label="Buscar colaboradores" placeholder="Buscar por nombre o correo" value={query} onChange={event => setQuery(event.target.value)} /></InputGroup>
          <Text ml={{ md: 'auto' }} color={muted} fontSize="sm">{visible.length} {visible.length === 1 ? 'colaborador' : 'colaboradores'}</Text>
        </Flex>
      </Box>

      {loading ? <Center py={16}><Spinner size="xl" color="brand.500" /></Center> : visible.length === 0 ? (
        <Card py={14} align="center"><Center bg="secondaryGray.100" boxSize="56px" borderRadius="full" mb={3}><Icon as={MdManageAccounts} boxSize={7} color="secondaryGray.500" /></Center><Text fontWeight="700">{query ? 'No encontramos colaboradores' : 'Aún no hay colaboradores'}</Text><Text color={muted} fontSize="sm" textAlign="center" mt={1}>{query ? 'Probá con otro nombre o correo.' : 'Agregá a la primera persona de tu equipo.'}</Text>{!query && <Button mt={5} leftIcon={<MdAdd />} colorScheme="brand" onClick={openCreate}>Agregar colaborador</Button>}</Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>{visible.map(user => (
          <Card key={user.id} p={5} _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all .2s ease">
            <Flex align="center" gap={3}><Avatar name={user.name} bg="brand.500" color="white" /><Box minW={0} flex="1"><Flex align="center" gap={2}><Text fontWeight="800" noOfLines={1}>{user.name || 'Sin nombre'}</Text><Badge colorScheme={user.active === false ? 'gray' : 'green'} borderRadius="full">{user.active === false ? 'Inactivo' : 'Activo'}</Badge></Flex><Text color={muted} fontSize="sm" noOfLines={1}>{user.email}</Text></Box><Button size="sm" variant="ghost" colorScheme="brand" leftIcon={<MdEdit />} onClick={() => openEdit(user)}>Editar</Button></Flex>
          </Card>
        ))}</SimpleGrid>
      )}
    </Box>
  );
}
