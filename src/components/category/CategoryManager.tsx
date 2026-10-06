import {
Flex, HStack, IconButton, Input, Modal, ModalBody,
ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useToast
} from '@chakra-ui/react';
import Form from 'components/form/Form';
import FormActions from 'components/form/FormActions';
import FormField from 'components/form/FormField';
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

  useEffect(() => { if (isOpen) setValues(categories); }, [categories, isOpen]);
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

  return <Modal isOpen={isOpen} onClose={onClose} onOverlayClick={onClose} isCentered size="lg"><ModalOverlay /><ModalContent><Form isSubmitting={saving} onFormSubmit={(event) => { event.preventDefault(); save(); }}><ModalHeader>Administrar categorías</ModalHeader><ModalCloseButton /><ModalBody><Text color="gray.500" fontSize="sm" mb={4}>Creá, renombrá o eliminá las opciones disponibles. Los registros existentes no cambian automáticamente al renombrar.</Text><FormField  label={<>Nueva categoría</>}><HStack><Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} /><IconButton type="button" aria-label="Agregar categoría" icon={<MdAdd />} colorScheme="brand" onClick={add} /></HStack></FormField><Stack mt={5} spacing={2}>{values.map((value, index) => <Flex key={`${value}-${index}`} align="center" p={3} borderWidth="1px" borderRadius="xl">{editingIndex === index ? <Input flex="1" value={editValue} onChange={(event) => setEditValue(event.target.value)} autoFocus /> : <Text flex="1" fontWeight="700">{value}</Text>}{editingIndex === index ? <><IconButton type="button" aria-label="Confirmar nombre" icon={<MdCheck />} size="sm" colorScheme="brand" onClick={confirmRename} /><IconButton type="button" aria-label="Cancelar edición" icon={<MdClose />} size="sm" variant="ghost" onClick={() => setEditingIndex(null)} /></> : <IconButton type="button" aria-label={`Renombrar ${value}`} icon={<MdEdit />} size="sm" variant="ghost" onClick={() => startRename(index)} />}<IconButton type="button" aria-label={`Eliminar ${value}`} icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => setValues(values.filter((_, itemIndex) => itemIndex !== index))} /></Flex>)}</Stack></ModalBody><ModalFooter w="100%" display="block"><FormActions submitLabel="Guardar cambios" isLoading={saving} onCancel={onClose} showCancel /></ModalFooter></Form></ModalContent></Modal>;
}
