import { sortCategories } from 'utils/categories';
import { Flex, HStack, IconButton, Input, Stack, Text, useToast } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import DeleteModal from 'components/modal/DeleteModal';
import FormModal from 'components/modal/FormModal';
import ModalList from 'components/modal/ModalList';
import { useEffect, useState } from 'react';
import { MdAdd, MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import CategoryService, { CategoryInUseError, CategoryKind } from 'services/CategoryService';

type Props = { kind: CategoryKind; categories: string[]; isOpen: boolean; onClose: () => void; onSaved: () => Promise<void> | void };

export default function CategoryManager({ kind, categories, isOpen, onClose, onSaved }: Props) {
  const [values, setValues] = useState(sortCategories(categories));
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const toast = useToast();
  const remove = async () => {
    if (pendingDelete === null || checking) return;
    setChecking(true);
    try {
      const original = Object.keys(renames).find(key => renames[key] === pendingDelete) || pendingDelete;
      await CategoryService.assertUnused(kind, [original]);
      setValues(items => items.filter(item => item !== pendingDelete));
      setEditingIndex(null);
      setPendingDelete(null);
    } catch (error) {
      toast({ status: error instanceof CategoryInUseError ? 'warning' : 'error',
        title: error instanceof CategoryInUseError ? error.message : 'No se pudo verificar si la categoría tiene valores asociados. Intente nuevamente.' });
      setPendingDelete(null);
    } finally { setChecking(false); }
  };

  useEffect(() => { if (isOpen) { setValues(sortCategories(categories)); setRenames({}); setDraft(''); setEditingIndex(null); setPendingDelete(null); } }, [categories, isOpen]);
  const add = () => {
    const value = draft.trim();
    if (!value || values.some((item) => item.toLocaleLowerCase('es') === value.toLocaleLowerCase('es'))) return;
    setValues(sortCategories([...values, value])); setDraft('');
  };
  const startRename = (index: number) => { setEditingIndex(index); setEditValue(values[index]); };
  const confirmRename = () => {
    const next = editValue.trim();
    if (editingIndex !== null && next && !values.some((item, index) => index !== editingIndex && item.toLocaleLowerCase('es') === next.toLocaleLowerCase('es'))) {
      const before = values[editingIndex];
      const original = Object.keys(renames).find(key => renames[key] === before) || before;
      setRenames({ ...renames, [original]: next });
      setValues(sortCategories(values.map((item, index) => index === editingIndex ? next : item)));
    }
    setEditingIndex(null);
  };
  const save = async () => {
    setSaving(true);
    try { await CategoryService.save(kind, values, renames); await onSaved(); toast({ status: 'success', title: 'Categorías actualizadas' }); onClose(); }
    catch (error) { toast({ status: error instanceof CategoryInUseError ? 'warning' : 'error', title: error instanceof CategoryInUseError ? error.message : 'No se pudieron guardar las categorías' }); }
    finally { setSaving(false); }
  };

  return <><FormModal title="Administrar categorías" description="Los cambios de nombre conservan la asignación de los registros existentes."
    isOpen={isOpen} onClose={onClose} onSubmit={save} submitLabel="Guardar cambios" isSubmitting={saving} isDisabled={editingIndex !== null || pendingDelete !== null || checking} size="lg">
    <Stack spacing={4}>
      <FormField label="Nueva categoría"><HStack><Input value={draft} onChange={event => setDraft(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} />
        <IconButton type="button" aria-label="Agregar categoría" icon={<MdAdd />} colorScheme="brand" onClick={add} /></HStack>
      </FormField>
      <Text fontSize="sm" fontWeight="700">Categorías ({values.length})</Text>
      <ModalList isDisabled={editingIndex !== null} items={values} renderItem={(value, index) => <Flex align="center" p={1} borderWidth="1px" borderRadius="12px" gap={1}>
        {editingIndex === index ? <Input aria-label={`Nombre de ${value}`} flex="1" minW={0} value={editValue} onChange={event => setEditValue(event.target.value)} autoFocus
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); confirmRename(); } }} /> : <Text flex="1" minW={0} fontSize="sm" fontWeight="700" overflowWrap="anywhere">{value}</Text>}
        {editingIndex === index ? <><IconButton type="button" aria-label="Confirmar nombre" icon={<MdCheck />} size="sm" h={{ base: "40px", md: "32px" }} minH={{ base: "40px", md: "32px" }} minW={{ base: "40px", md: "32px" }} colorScheme="brand" onClick={confirmRename} />
          <IconButton type="button" aria-label="Cancelar edición" icon={<MdClose />} size="sm" h={{ base: "40px", md: "32px" }} minH={{ base: "40px", md: "32px" }} minW={{ base: "40px", md: "32px" }} variant="ghost" onClick={() => setEditingIndex(null)} /></> :
          <IconButton type="button" aria-label={`Renombrar ${value}`} icon={<MdEdit />} size="sm" h={{ base: "40px", md: "32px" }} minH={{ base: "40px", md: "32px" }} minW={{ base: "40px", md: "32px" }} variant="ghost" onClick={() => startRename(index)} />}
        <IconButton type="button" aria-label={`Eliminar ${value}`} icon={<MdDelete />} size="sm" h={{ base: "40px", md: "32px" }} minH={{ base: "40px", md: "32px" }} minW={{ base: "40px", md: "32px" }} variant="ghost" colorScheme="red" isDisabled={editingIndex !== null || saving} onClick={() => setPendingDelete(value)} />
      </Flex>} />
      {editingIndex !== null && <Text fontSize="sm" color="gray.500">Confirme el nombre o cancele la edición antes de guardar.</Text>}
    </Stack>
  </FormModal>
    <DeleteModal isOpen={pendingDelete !== null} onClose={() => setPendingDelete(null)} handle={remove} isLoading={checking}
      message={`¿Eliminar la categoría “${pendingDelete}”? El cambio se aplicará al guardar. Solo se pueden eliminar categorías sin valores asociados.`} />
  </>;
}
