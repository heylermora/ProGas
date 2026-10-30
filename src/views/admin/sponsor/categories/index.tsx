import { Badge, Box, Button, Flex, Heading, HStack, Input, Select, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import Card from 'components/card/Card';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import EmptyState from 'components/dataDisplay/EmptyState';
import FormField from 'components/form/FormField';
import FormPageHeader from 'components/layout/FormPageHeader';
import FormModal from 'components/modal/FormModal';
import EmojiField from 'components/category/EmojiField';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdAdd, MdCategory, MdEdit } from 'react-icons/md';
import { Prompt } from 'react-router-dom';
import CategoryService from 'services/CategoryService';
import SponsorService from 'services/SponsorService';
import { BusinessCategorySettings, completeBusinessSettings } from 'utils/businessCategories';

type Editor = { level: 'general' | 'specific'; original?: string; name: string; icon: string; parent: string };
export default function BusinessCategoriesPage() {
  const loadVersion = useRef(0);
  const [settings, setSettings] = useState<BusinessCategorySettings>({ groups: [], icons: {} });
  const [values, setValues] = useState<string[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [fieldError, setFieldError] = useState('');
  const toast = useToast();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const iconBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true); setError('');
    try {
      const [categories, businesses] = await Promise.all([CategoryService.get('sponsors'), SponsorService.getAll()]);
      const all = Array.from(new Set([...categories, ...businesses.map(business => business.category).filter(Boolean)]));
      const config = await CategoryService.getBusinessSettings(all);
      if (version !== loadVersion.current) return;
      setValues(all); setSettings(config); setTab(0); setDirty(false);
    } catch { if (version === loadVersion.current) setError('No se pudieron cargar las categorías. Intentá nuevamente.'); }
    finally { if (version === loadVersion.current) setLoading(false); }
  }, []);
  useEffect(() => { void load(); return () => { loadVersion.current += 1; }; }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const openEditor = (next: Editor) => { setFieldError(''); setEditor(next); };
  const apply = () => {
    if (!editor) return;
    const name = editor.name.trim();
    const names = editor.level === 'general' ? settings.groups.map(group => group.name) : values;
    if (!name) { setFieldError('Ingresá un nombre.'); return; }
    if (names.some(value => value !== editor.original && value.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))) { setFieldError('Ya existe una categoría con ese nombre.'); return; }
    if (editor.level === 'general') {
      if (editor.original) setSettings({ ...settings, groups: settings.groups.map(group => group.name === editor.original ? { ...group, name, icon: editor.icon } : group) });
      else { setSettings({ ...settings, groups: [...settings.groups, { name, icon: editor.icon, categories: [] }] }); setTab(settings.groups.length); }
    } else {
      if (!settings.groups.some(group => group.name === editor.parent)) { setFieldError('Elegí una categoría general.'); return; }
      // Specific names identify existing businesses; editing preserves that name.
      const category = editor.original || name;
      if (!editor.original) setValues([...values, category]);
      setSettings({ icons: { ...settings.icons, [category]: editor.icon }, groups: settings.groups.map(group => ({ ...group, categories: [...group.categories.filter(value => value !== category), ...(group.name === editor.parent ? [category] : [])] })) });
      setTab(settings.groups.findIndex(group => group.name === editor.parent));
    }
    setDirty(true); setEditor(null);
  };
  const save = async () => {
    if (saving || !dirty) return;
    setSaving(true);
    try { await CategoryService.saveBusinessSettings(values, completeBusinessSettings(values, settings)); setDirty(false); toast({ status: 'success', title: 'Categorías guardadas' }); }
    catch { toast({ status: 'error', title: 'No se pudieron guardar las categorías', description: 'Tus cambios siguen disponibles. Volvé a intentar.' }); }
    finally { setSaving(false); }
  };
  return <Box pt={{ base: '120px', md: '80px' }} pb="32px" minW={0}>
    <Prompt when={dirty} message="Tenés cambios sin guardar. ¿Querés salir de esta página?" />
    <FormPageHeader title="Categorías de comercios" description="Organizá las categorías específicas dentro de cada general y elegí sus íconos." back="/admin/sponsor/index" status={dirty ? <Badge colorScheme="orange">Cambios sin guardar</Badge> : undefined} />
    <AsyncContent isLoading={loading} error={error} loadingLabel="Cargando categorías…">
      <Stack spacing={5}>
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
          <Box><Heading size="md">Categorías generales</Heading><Text fontSize="sm" color={muted} mt={1}>Seleccioná una pestaña para ver sus categorías específicas.</Text></Box>
          <Button leftIcon={<MdAdd />} variant="outline" flexShrink={0} whiteSpace="nowrap" isDisabled={saving} onClick={() => openEditor({ level: 'general', name: '', icon: '🏪', parent: '' })}>Nueva general</Button>
        </Flex>
        {settings.groups.length ? <Tabs index={tab} onChange={setTab} colorScheme="brand" isLazy minW={0}>
          <TabList overflowX="auto" overflowY="hidden" maxW="100%" pb={1}>
            {settings.groups.map(group => <Tab key={group.name} flexShrink={0} gap={2} whiteSpace="nowrap" isDisabled={saving}><Text as="span" fontSize="xl" aria-hidden="true">{group.icon}</Text>{group.name}<Badge borderRadius="full">{group.categories.length}</Badge></Tab>)}
          </TabList>
          <TabPanels>
            {settings.groups.map(group => <TabPanel key={group.name} px={0} py={5}>
              <Card p={{ base: 4, md: 6 }}>
                <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} gap={4} mb={5}>
                  <HStack spacing={3}><Box bg={iconBg} borderRadius="14px" p={3} fontSize="28px" aria-hidden="true">{group.icon}</Box><Box><Heading size="md">{group.name}</Heading><Text fontSize="sm" color={muted}>{group.categories.length} categorías específicas</Text></Box></HStack>
                  <Flex gap={2} flexWrap="wrap"><Button variant="ghost" leftIcon={<MdEdit />} isDisabled={saving} onClick={() => openEditor({ level: 'general', original: group.name, name: group.name, icon: group.icon, parent: '' })}>Editar general</Button><Button colorScheme="brand" leftIcon={<MdAdd />} isDisabled={saving} onClick={() => openEditor({ level: 'specific', name: '', icon: '🏪', parent: group.name })}>Nueva específica</Button></Flex>
                </Flex>
                {group.categories.length ? <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3}>
                  {group.categories.map(category => <Flex key={category} borderWidth="1px" borderRadius="14px" p={3} gap={3} align="center" minW={0}>
                    <Box bg={iconBg} borderRadius="12px" boxSize="44px" display="grid" placeItems="center" fontSize="26px" flexShrink={0} aria-hidden="true">{settings.icons[category] || '🏪'}</Box>
                    <Text flex={1} minW={0} fontSize="sm" fontWeight="600" overflowWrap="anywhere">{category.replace(/\//g, ' / ')}</Text>
                    <Button size="sm" variant="ghost" aria-label={`Editar ${category}`} isDisabled={saving} onClick={() => openEditor({ level: 'specific', original: category, name: category, icon: settings.icons[category] || '🏪', parent: group.name })}>Editar</Button>
                  </Flex>)}
                </SimpleGrid> : <EmptyState icon={MdCategory} title="Todavía no hay categorías específicas" description="Agregá la primera categoría a este grupo." />}
              </Card>
            </TabPanel>)}
          </TabPanels>
        </Tabs> : <EmptyState icon={MdCategory} title="Creá tu primera categoría general" description="Después podrás agregar sus categorías específicas." />}
        <Flex justify="flex-end"><Button colorScheme="brand" w={{ base: '100%', sm: 'auto' }} isDisabled={!dirty} isLoading={saving} onClick={save}>Guardar cambios</Button></Flex>
      </Stack>
    </AsyncContent>
    {error && <Button onClick={load}>Reintentar</Button>}
    <FormModal title={editor ? `${editor.original ? 'Editar' : 'Nueva'} categoría ${editor.level === 'general' ? 'general' : 'específica'}` : 'Categoría'} isOpen={Boolean(editor)} onClose={() => setEditor(null)} onSubmit={apply} submitLabel="Aplicar" size="lg">
      {editor && <Stack spacing={5}>
        <FormField label="Nombre" error={fieldError} help={editor.level === 'specific' && editor.original ? 'El nombre se conserva para mantener la asignación de los comercios existentes.' : undefined}><Input value={editor.name} isReadOnly={editor.level === 'specific' && Boolean(editor.original)} onChange={event => { setEditor({ ...editor, name: event.target.value }); setFieldError(''); }} maxLength={100} /></FormField>
        {editor.level === 'specific' && <FormField label="Categoría general"><Select value={editor.parent} onChange={event => setEditor({ ...editor, parent: event.target.value })}>{settings.groups.map(group => <option key={group.name}>{group.name}</option>)}</Select></FormField>}
        <EmojiField value={editor.icon} onChange={icon => setEditor({ ...editor, icon })} />
      </Stack>}
    </FormModal>
  </Box>;
}
