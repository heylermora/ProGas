import { Button, HStack, Input, Select, Stack, Text, useToast } from '@chakra-ui/react';
import FormModal from 'components/modal/FormModal';
import FormField from 'components/form/FormField';
import ModalList from 'components/modal/ModalList';
import { useEffect, useState } from 'react';
import CategoryService from 'services/CategoryService';
import { BusinessCategorySettings, completeBusinessSettings, defaultBusinessSettings } from 'utils/businessCategories';

type Props = { categories: string[]; isOpen: boolean; onClose: () => void; onSaved: () => Promise<void> | void };
export default function BusinessCategoryManager({ categories, isOpen, onClose, onSaved }: Props) {
  const [settings, setSettings] = useState<BusinessCategorySettings>(defaultBusinessSettings(categories));
  const [values, setValues] = useState(categories);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏪');
  const [parent, setParent] = useState('');
  const [level, setLevel] = useState('general');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setLoading(true); setFailed(false); setValues(categories); setName('');
    CategoryService.getBusinessSettings(categories).then(data => { if (mounted) { setSettings(data); setParent(data.groups[0]?.name || ''); } })
      .catch(() => { if (mounted) setFailed(true); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [categories, isOpen]);
  const add = () => {
    const next = name.trim();
    if (!next || !icon.trim()) return;
    if (level === 'general') {
      if (settings.groups.some(group => group.name.toLocaleLowerCase('es') === next.toLocaleLowerCase('es'))) return;
      setSettings({ ...settings, groups: [...settings.groups, { name: next, icon: icon.trim(), categories: [] }] }); setParent(next);
    } else {
      if (!parent || values.some(value => value.toLocaleLowerCase('es') === next.toLocaleLowerCase('es'))) return;
      setValues([...values, next]);
      setSettings({ groups: settings.groups.map(group => group.name === parent ? { ...group, categories: [...group.categories, next] } : group), icons: { ...settings.icons, [next]: icon.trim() } });
    }
    setName('');
  };
  const save = async () => {
    setSaving(true);
    try { await CategoryService.saveBusinessSettings(values, completeBusinessSettings(values, settings)); await onSaved(); onClose(); }
    catch { toast({ status: 'error', title: 'No se pudieron guardar las categorías' }); }
    finally { setSaving(false); }
  };
  return <FormModal title="Administrar categorías" isOpen={isOpen} onClose={onClose} onSubmit={save} submitLabel="Guardar cambios" isSubmitting={saving} isDisabled={loading || failed} size="lg">
    {loading ? <Text role="status">Cargando categorías…</Text> : failed ? <Text role="alert">No se pudieron cargar las categorías. Cerrá y volvé a intentar.</Text> : <Stack spacing={4}>
      <FormField label="Nivel"><Select value={level} onChange={event => setLevel(event.target.value)}><option value="general">General</option><option value="specific">Específica</option></Select></FormField>
      {level === 'specific' && <FormField label="Categoría general"><Select value={parent} onChange={event => setParent(event.target.value)}>{settings.groups.map(group => <option key={group.name}>{group.name}</option>)}</Select></FormField>}
      <FormField label="Nueva categoría"><Input value={name} onChange={event => setName(event.target.value)} /></FormField>
      <FormField label="Ícono de la nueva categoría" help="Usá un emoji o símbolo."><Input value={icon} onChange={event => setIcon(event.target.value)} maxLength={24} /></FormField>
      <Button onClick={add} isDisabled={!name.trim() || !icon.trim() || (level === 'specific' && !parent)}>Agregar categoría</Button>
      <Text fontWeight="bold">Generales</Text>
      <ModalList items={settings.groups} renderItem={(group, index) => <HStack><Text flex="1">{group.name}</Text><Input aria-label={`Ícono de ${group.name}`} w="90px" maxLength={24} value={group.icon} onChange={event => setSettings({ ...settings, groups: settings.groups.map((item, i) => i === index ? { ...item, icon: event.target.value } : item) })} /></HStack>} />
      <Text fontWeight="bold">Específicas</Text>
      <ModalList items={values} renderItem={category => <Stack borderWidth="1px" borderRadius="12px" p={3}><Text fontWeight="bold">{category}</Text><HStack><Input aria-label={`Ícono de ${category}`} w="90px" maxLength={24} value={settings.icons[category] || '🏪'} onChange={event => setSettings({ ...settings, icons: { ...settings.icons, [category]: event.target.value } })} /><Select aria-label={`General de ${category}`} value={settings.groups.find(group => group.categories.includes(category))?.name || ''} onChange={event => setSettings({ ...settings, groups: settings.groups.map(group => ({ ...group, categories: [...group.categories.filter(value => value !== category), ...(group.name === event.target.value ? [category] : [])] })) })}>{settings.groups.map(group => <option key={group.name}>{group.name}</option>)}</Select></HStack></Stack>} />
    </Stack>}
  </FormModal>;
}
