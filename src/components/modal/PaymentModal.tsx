import {
Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Alert, AlertIcon,
Box, Button, Flex, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast
} from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import FormModal from './FormModal';
import ModalSection from './ModalSection';

type PaymentMethod = 'Efectivo' | 'Sinpe' | 'Tarjeta' | 'Otro';

type PaymentRow = {
  method: PaymentMethod;
  amount: string; // string para el input
  reference?: string; // sinpe/tarjeta/otro
  note?: string;
};

function toNumber(v: string) {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatCRC(n: number) {
  return `₡ ${Number(n || 0).toLocaleString('es-CR')}`;
}

function PaymentModal(props: {
  title?: string;
  id: string;
  totalToPay: number; // ✅ total a pagar
  isOpen: boolean;
  onClose: () => void;
  onSave?: (payload: any) => void | Promise<void>;
  onSaved?: (payload: any) => void | Promise<void>;
  initialPayments?: Array<{ method: PaymentMethod; amount: number; reference?: string | null; note?: string | null }>;
  initialPaidAt?: string;
  initialNote?: string | null;
}) {
  const { title = 'Añadir pago', id, totalToPay, isOpen, onClose, onSaved, onSave, initialPayments, initialPaidAt, initialNote } = props;

  const toast = useToast();
  const [rows, setRows] = useState<PaymentRow[]>([{ method: 'Efectivo', amount: '' }]);
  const localNow = () => {
    const value = new Date();
    value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
    return value.toISOString().slice(0, 16);
  };
  const [paidAt, setPaidAt] = useState(localNow);
  const [generalNote, setGeneralNote] = useState('');
  const [expandedRow, setExpandedRow] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // reset cuando abre
  useEffect(() => {
    if (isOpen) {
      setRows(initialPayments?.length ? initialPayments.map(payment => ({ ...payment, amount: String(payment.amount), reference: payment.reference || '', note: payment.note || '' })) : [{ method: 'Efectivo', amount: '' }]);
      setPaidAt(initialPaidAt ? new Date(initialPaidAt).toISOString().slice(0, 16) : localNow());
      setGeneralNote(initialNote || '');
      setIsSaving(false);
      setExpandedRow(initialPayments?.length ? -1 : 0);
      setSubmitted(false);
      setFeedback('');
    }
  }, [initialNote, initialPaidAt, initialPayments, isOpen]);

  const totalPaid = useMemo(() => rows.reduce((sum, r) => sum + toNumber(r.amount), 0), [rows]);
  const diff = useMemo(() => totalPaid - (totalToPay || 0), [totalPaid, totalToPay]);

  const hasChange = diff > 0;
  const hasPending = diff < 0;
  const diffLabel = hasChange ? 'Vuelto' : hasPending ? 'Pendiente' : 'Vuelto / Pendiente';

  const addRow = () => { setRows(prev => [...prev, { method: 'Sinpe', amount: '', reference: '' }]); setExpandedRow(rows.length); };

  const removeRow = (idx: number) => { setRows(prev => prev.filter((_, i) => i !== idx)); setExpandedRow(0); };

  const updateRow = (idx: number, patch: Partial<PaymentRow>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const validate = () => {
    if (!paidAt || !Number.isFinite(new Date(paidAt).getTime())) return 'Revise la fecha de pago.';
    if (!rows.length) return 'Agregá al menos un método de pago.';
    if (totalToPay <= 0) return 'El total a pagar debe ser mayor a 0.';
    if (totalPaid <= 0) return 'El total pagado debe ser mayor a 0.';

    for (const r of rows) {
      if (toNumber(r.amount) <= 0) return 'Cada método debe tener un monto mayor a 0.';
      const needsRef = r.method === 'Sinpe' || r.method === 'Tarjeta' || r.method === 'Otro';
      if (needsRef && !String(r.reference ?? '').trim()) return `Falta referencia en ${r.method}.`;
    }

    // ✅ Bloquea pagos incompletos (si querés permitir parciales, quitá esta regla)
    if (totalPaid < totalToPay) return 'El monto pagado es menor al total a pagar.';

    return null;
  };

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;
    setSubmitted(true);
    const err = validate();
    if (err) {
      setFeedback(err);
      const invalidRow = rows.findIndex(r => toNumber(r.amount) <= 0 || (r.method !== 'Efectivo' && !String(r.reference || '').trim()));
      if (invalidRow >= 0) setExpandedRow(invalidRow);
      return;
    }

    setFeedback('');
    const payload = {
      entityId: id,
      paidAt: new Date(paidAt).toISOString(),
      totalToPay,
      totalPaid,
      change: hasChange ? diff : 0,
      pending: hasPending ? Math.abs(diff) : 0,
      note: generalNote?.trim() || null,
      payments: rows.map(r => ({
        method: r.method,
        amount: toNumber(r.amount),
        reference: r.reference?.trim() || null,
        note: r.note?.trim() || null,
      })),
    };

    setIsSaving(true);
    try {
      if (onSave) await onSave(payload);
      else console.log('PAYMENT PAYLOAD:', payload);

      await onSaved?.(payload);
      toast({ status: 'success', title: 'Pago guardado', duration: 1800, isClosable: true });
      handleClose();
    } catch (e) {
      console.error(e);
      toast({ status: 'error', title: 'Error guardando el pago', duration: 2500, isClosable: true });
    } finally {
      setIsSaving(false);
      setExpandedRow(initialPayments?.length ? -1 : 0);
      setSubmitted(false);
      setFeedback('');
    }
  };

  return <FormModal isOpen={isOpen} onClose={handleClose} title={title} description="Registre los montos recibidos y compruebe el total."
    onSubmit={handleSave} submitLabel="Guardar pago" isSubmitting={isSaving}>
    <Stack spacing={4}>
      <SimpleGrid columns={3} spacing={3} bg="blackAlpha.50" p={3} borderRadius="14px">
        <Box><Text fontSize="xs">A pagar</Text><Text fontWeight="800" fontSize="sm" overflowWrap="anywhere">{formatCRC(totalToPay)}</Text></Box>
        <Box><Text fontSize="xs">Pagado</Text><Text fontWeight="800" fontSize="sm" overflowWrap="anywhere">{formatCRC(totalPaid)}</Text></Box>
        <Box><Text fontSize="xs">{diffLabel}</Text><Text fontWeight="800" fontSize="sm" overflowWrap="anywhere" color={hasChange ? 'green.600' : hasPending ? 'red.500' : undefined}>{formatCRC(Math.abs(diff))}</Text></Box>
      </SimpleGrid>
      {feedback && <Alert status="warning" borderRadius="12px" role="alert"><AlertIcon />{feedback}</Alert>}
      <Flex align="center" justify="space-between" gap={2} wrap="wrap">
        <Text fontWeight="700" fontSize="sm">Métodos de pago ({rows.length})</Text>
        <Button type="button" leftIcon={<MdAdd />} size="sm" variant="outline" onClick={addRow}>Agregar método</Button>
      </Flex>
      <Accordion allowToggle index={expandedRow} onChange={index => setExpandedRow(index as number)}>
        {rows.map((r, idx) => {
          const needsRef = r.method !== 'Efectivo';
          const refLabel = r.method === 'Sinpe' ? 'Referencia SINPE' : r.method === 'Tarjeta' ? 'Autorización / Voucher' : 'Referencia';
          const invalidAmount = submitted && toNumber(r.amount) <= 0;
          const invalidReference = submitted && needsRef && !String(r.reference || '').trim();
          return <AccordionItem key={idx} borderWidth="1px" borderRadius="14px" mb={2} overflow="hidden">
            <AccordionButton p={3}>
              <Box flex="1" textAlign="left" minW={0}><Text fontSize="sm" fontWeight="700">{idx + 1}. {r.method} · {formatCRC(toNumber(r.amount))}</Text>
                <Text fontSize="xs" color={invalidAmount || invalidReference ? 'red.500' : 'gray.500'} noOfLines={1}>
                  {invalidAmount || invalidReference ? 'Revise los datos de este método' : needsRef ? r.reference ? `Referencia: ${r.reference}` : 'Referencia pendiente' : 'Pago en efectivo'}
                </Text></Box><AccordionIcon />
            </AccordionButton>
            <AccordionPanel p={3} pt={1}>
              <Stack spacing={3}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <FormField label="Método" isRequired><Select value={r.method} onChange={e => updateRow(idx, { method: e.target.value as PaymentMethod, reference: '' })}>
                    <option value="Efectivo">Efectivo</option><option value="Sinpe">SINPE</option><option value="Tarjeta">Tarjeta</option><option value="Otro">Otro</option>
                  </Select></FormField>
                  <FormField label="Monto" isRequired error={invalidAmount ? 'Ingrese un monto mayor que cero.' : undefined}>
                    <Input inputMode="decimal" placeholder="0" value={r.amount} onChange={e => updateRow(idx, { amount: e.target.value })} />
                  </FormField>
                </SimpleGrid>
                {needsRef && <FormField label={refLabel} isRequired error={invalidReference ? 'Ingrese la referencia del pago.' : undefined}>
                  <Input placeholder="Número o detalle de referencia" value={r.reference || ''} onChange={e => updateRow(idx, { reference: e.target.value })} />
                </FormField>}
                <ModalSection title="Nota del método (opcional)" summary={r.note || undefined}>
                  <Input aria-label={`Nota del método ${idx + 1}`} value={r.note || ''} onChange={e => updateRow(idx, { note: e.target.value })} />
                </ModalSection>
                {rows.length > 1 && <Button type="button" alignSelf="flex-start" leftIcon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => removeRow(idx)}>Eliminar método {idx + 1}</Button>}
              </Stack>
            </AccordionPanel>
          </AccordionItem>;
        })}
      </Accordion>
      <ModalSection title="Fecha y nota general" summary={generalNote ? 'Incluye una nota' : undefined} reveal={submitted && (!paidAt || !Number.isFinite(new Date(paidAt).getTime()))}>
        <Stack spacing={3}>
          <FormField label="Fecha de pago" isRequired error={submitted && (!paidAt || !Number.isFinite(new Date(paidAt).getTime())) ? 'Revise la fecha de pago.' : undefined}><Input type="datetime-local" value={paidAt} onChange={e => setPaidAt(e.target.value)} /></FormField>
          <FormField label="Nota general"><Textarea rows={2} minH="80px" value={generalNote} onChange={e => setGeneralNote(e.target.value)} placeholder="Opcional" /></FormField>
        </Stack>
      </ModalSection>
    </Stack>
  </FormModal>;
}

export default PaymentModal;
