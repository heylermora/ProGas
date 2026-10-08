import {
Avatar, Box, Button, Flex, Input, SimpleGrid,
Text, useColorModeValue, useToast
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import EmptyState from 'components/dataDisplay/EmptyState';
import StatusBadge from 'components/dataDisplay/StatusBadge';
import ActiveSwitch from 'components/form/ActiveSwitch';
import FormField from 'components/form/FormField';
import PasswordField from 'components/form/PasswordField';
import PageHeader from 'components/layout/PageHeader';
import FormModal from 'components/modal/FormModal';
import { usePageSearch } from 'contexts/PageSearchContext';
import UserItem from 'interfaces/UserItem';
import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdEdit, MdManageAccounts } from 'react-icons/md';
import UserService, { CollaboratorRollbackError } from 'services/UserService';

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
  const [submitted, setSubmitted] = useState(false);
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

  const close = () => { setSubmitted(false); setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };
  const openCreate = () => { setSubmitted(false); setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (user: UserItem) => {
    setSubmitted(false);
    setEditing(user);
    setForm({ name: user.name || '', email: user.email || '', password: '', active: user.active !== false });
    setShowForm(true);
  };
  const change = (field: keyof FormState, value: string | boolean) =>
    setForm(current => ({ ...current, [field]: value }));

  const save = async () => {
    if (saving) return;
    setSubmitted(true);
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
        <FormModal isOpen={showForm} isSubmitting={saving} onSubmit={save} title={editing ? 'Editar colaborador' : 'Nuevo colaborador'} description="Datos personales y acceso." onClose={close} submitLabel={editing ? 'Guardar cambios' : 'Crear acceso'}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormField id="user-name" label="Nombre completo" error={submitted && !form.name.trim() ? 'El campo es requerido.' : undefined} isRequired><Input id="user-name" autoComplete="name" value={form.name} onChange={event => change('name', event.target.value)} /></FormField>
            <FormField id="user-email" label="Correo electrónico" error={submitted && !form.email.trim() ? 'El campo es requerido.' : undefined} isRequired isDisabled={Boolean(editing)}><Input id="user-email" type="email" autoComplete="email" value={form.email} onChange={event => change('email', event.target.value)} /></FormField>
            {!editing && <PasswordField id="user-password" label="Contraseña temporal" value={form.password} onChange={value => change('password', value)} isNew isDisabled={saving} error={submitted && form.password.length < 6 ? 'La contraseña debe tener al menos 6 caracteres.' : undefined} />}
          </SimpleGrid>
          <Box mt={4}><ActiveSwitch id="user-active" label="Acceso activo" isChecked={form.active} onChange={checked => change('active', checked)} /></Box>
        </FormModal>
      )}

      <Text mb={5} textAlign="right" color={muted} fontSize="sm">{visible.length} {visible.length === 1 ? 'colaborador' : 'colaboradores'}</Text>

      {loading ? <AsyncContent isLoading loadingLabel="Cargando colaboradores" /> : visible.length === 0 ? (
        <EmptyState icon={MdManageAccounts} title={query ? 'No encontramos colaboradores' : 'Aún no hay colaboradores'} description={query ? 'Probá con otro nombre o correo.' : 'Agregá a la primera persona de tu equipo.'} actionLabel={!query ? 'Agregar colaborador' : undefined} actionIcon={<MdAdd />} onAction={!query ? openCreate : undefined} />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2, '2xl': 3 }} spacing={4}>{visible.map(user => (
          <Card key={user.id} p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="blackAlpha.100" _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: 'brand.200' }} transition="all .2s ease">
            <Flex align="flex-start" gap={4}>
              <Avatar name={user.name} size="lg" bg="brand.500" color="white" flexShrink={0} />
              <Box minW={0} flex="1">
                <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                  <Text fontWeight="900" fontSize="lg" lineHeight="short" wordBreak="break-word">{user.name || 'Sin nombre'}</Text>
                  <StatusBadge active={user.active !== false} />
                </Flex>
                <Text color={muted} fontSize="sm" mt={2} wordBreak="break-all">{user.email}</Text>
                <Button mt={4} size="sm" variant="outline" colorScheme="brand" leftIcon={<MdEdit />} onClick={() => openEdit(user)}>Editar acceso</Button>
              </Box>
            </Flex>
          </Card>
        ))}</SimpleGrid>
      )}
    </Box>
  );
}
