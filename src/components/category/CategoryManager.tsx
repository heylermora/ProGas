import { Flex, HStack, IconButton, Input, Stack, Text, useToast } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import FormModal from 'components/modal/FormModal';
import ModalList from 'components/modal/ModalList';
import { useEffect, useState } from 'react';
import { MdAdd, MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import CategoryService, { CategoryKind } from 'services/CategoryService';

type Props = { kind: CategoryKind; categories: string[]; isOpen: boolean; onClose: () => void; onSaved: () => Promise<void> | void };

export default function CategoryManager({ kind, categories, isOpen, onClose, onSaved }: Props) {
  const [values, setValues] = useState(categories);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const toast = useToast();

  useEffect(() => { if (isOpen) { setValues(categories); setDraft(''); setEditingIndex(null); } }, [categories, isOpen]);
  const add = () => {
    const value = draft.trim();
    if (!value || values.some((item) => item.toLocaleLowerCase('es') === value.toLocaleLowerCase('es'))) return;
    setValues([...values, value]); setDraft('');
  };
  const startRename = (index: number) => { setEditingIndex(index); setEditValue(values[index]); };
  const confirmRename = () => {
    const next = editValue.trim();
    if (editingIndex !== null && next && !values.some((item, index) => index !== editingIndex && item.toLocaleLowerCase('es') === next.toLocaleLowerCase('es'))) setValues(values.map((item, index) => index === editingIndex ? next : item));
    setEditingIndex(null);
  };
  const save = async () => {
    setSaving(true);
    try { await CategoryService.save(kind, values); await onSaved(); toast({ status: 'success', title: 'Categorías actualizadas' }); onClose(); }
    catch { toast({ status: 'error', title: 'No se pudieron guardar las categorías' }); }
    finally { setSaving(false); }
  };

  return <FormModal title="Administrar categorías" description="Cambiar un nombre no actualiza los registros existentes."
    isOpen={isOpen} onClose={onClose} onSubmit={save} submitLabel="Guardar cambios" isSubmitting={saving} isDisabled={editingIndex !== null} size="lg">
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
        <IconButton type="button" aria-label={`Eliminar ${value}`} icon={<MdDelete />} size="sm" h={{ base: "40px", md: "32px" }} minH={{ base: "40px", md: "32px" }} minW={{ base: "40px", md: "32px" }} variant="ghost" colorScheme="red" onClick={() => { setValues(values.filter((_, itemIndex) => itemIndex !== index)); setEditingIndex(null); }} />
      </Flex>} />
      {editingIndex !== null && <Text fontSize="sm" color="gray.500">Confirme el nombre o cancele la edición antes de guardar.</Text>}
    </Stack>
  </FormModal>;
}
