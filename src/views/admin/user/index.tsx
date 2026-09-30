import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Badge, Box, Button, Flex, FormControl, FormHelperText,
  FormLabel, Input, SimpleGrid,
  Switch, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdManageAccounts } from 'react-icons/md';
import Card from 'components/card/Card';
import UserItem from 'interfaces/UserItem';
import UserService, { CollaboratorRollbackError } from 'services/UserService';
import { usePageSearch } from 'contexts/PageSearchContext';
import PageHeader from 'components/layout/PageHeader';
import FormPanel from 'components/form/FormPanel';
import EmptyState from 'components/dataDisplay/EmptyState';
import AsyncContent from 'components/dataDisplay/AsyncContent';

type FormState = { name: string; email: string; password: string; active: boolean };
const EMPTY_FORM: FormState = { name: '', email: '', password: '', active: true };

export default function Users() {
  const toast = useToast();
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const { query } = usePageSearch();
  const [users, setUsers] = useState<UserItem[]>([]);
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
      if (error instanceof CollaboratorRollbackError) {
        toast({
          status: 'error',
          duration: null,
          isClosable: true,
          title: 'La creación quedó incompleta',
          description: `Eliminá en Firebase Authentication la cuenta con UID ${error.userId} antes de volver a intentarlo.`,
        });
      } else {
        const message = error instanceof Error && error.message.includes('email-already-in-use')
          ? 'Ese correo ya está registrado' : 'No se pudo guardar el colaborador';
        toast({ status: 'error', title: message });
      }
    } finally { setSaving(false); }
  };

  return (
    <Box w="100%" pt={{ base: '110px', md: '80px' }} pb={8}>
      <PageHeader title="Colaboradores" description="Agregá y administrá el acceso de tu equipo." action={<Button leftIcon={<MdAdd />} colorScheme="brand" borderRadius="full" px={6} onClick={openCreate}>Agregar colaborador</Button>} />

      {showForm && (
        <FormPanel title={editing ? 'Editar colaborador' : 'Nuevo colaborador'} description={editing ? 'Actualizá su nombre o acceso.' : 'Creá sus credenciales de acceso.'} onClose={close} footer={
          <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl display="flex" alignItems="center" w="auto"><Switch colorScheme="brand" isChecked={form.active} onChange={event => change('active', event.target.checked)} /><FormLabel mb="0" ml={3}>Acceso activo</FormLabel></FormControl>
            <Flex gap={2}><Button variant="ghost" onClick={close}>Cancelar</Button><Button colorScheme="brand" px={7} isLoading={saving} loadingText="Guardando" onClick={save}>{editing ? 'Guardar cambios' : 'Crear acceso'}</Button></Flex>
          </Flex>
        }>
          <SimpleGrid columns={{ base: 1, md: editing ? 2 : 3 }} spacing={4}>
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input autoComplete="name" value={form.name} onChange={event => change('name', event.target.value)} /></FormControl>
            <FormControl isRequired isDisabled={Boolean(editing)}><FormLabel>Correo electrónico</FormLabel><Input type="email" autoComplete="email" value={form.email} onChange={event => change('email', event.target.value)} /></FormControl>
            {!editing && <FormControl isRequired><FormLabel>Contraseña temporal</FormLabel><Input type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={event => change('password', event.target.value)} /><FormHelperText>Al menos 6 caracteres.</FormHelperText></FormControl>}
          </SimpleGrid>
        </FormPanel>
      )}

      <Text mb={5} textAlign="right" color={muted} fontSize="sm">{visible.length} {visible.length === 1 ? 'colaborador' : 'colaboradores'}</Text>

      {loading ? <AsyncContent isLoading loadingLabel="Cargando colaboradores" /> : visible.length === 0 ? (
        <EmptyState icon={MdManageAccounts} title={query ? 'No encontramos colaboradores' : 'Aún no hay colaboradores'} description={query ? 'Probá con otro nombre o correo.' : 'Agregá a la primera persona de tu equipo.'} actionLabel={!query ? 'Agregar colaborador' : undefined} actionIcon={<MdAdd />} onAction={!query ? openCreate : undefined} />
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
