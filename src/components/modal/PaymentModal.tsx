import {
Box, Button, Divider, Flex, HStack,
IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Text, Textarea, useColorModeValue, useToast, VStack
} from '@chakra-ui/react';
import Form from 'components/form/Form';
import FormActions from 'components/form/FormActions';
import FormField from 'components/form/FormField';
import { useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

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
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const [rows, setRows] = useState<PaymentRow[]>([{ method: 'Efectivo', amount: '' }]);
  const localNow = () => {
    const value = new Date();
    value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
    return value.toISOString().slice(0, 16);
  };
  const [paidAt, setPaidAt] = useState(localNow);
  const [generalNote, setGeneralNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // reset cuando abre
  useEffect(() => {
    if (isOpen) {
      setRows(initialPayments?.length ? initialPayments.map(payment => ({ ...payment, amount: String(payment.amount), reference: payment.reference || '', note: payment.note || '' })) : [{ method: 'Efectivo', amount: '' }]);
      setPaidAt(initialPaidAt ? new Date(initialPaidAt).toISOString().slice(0, 16) : localNow());
      setGeneralNote(initialNote || '');
      setIsSaving(false);
    }
  }, [initialNote, initialPaidAt, initialPayments, isOpen]);

  const totalPaid = useMemo(() => rows.reduce((sum, r) => sum + toNumber(r.amount), 0), [rows]);
  const diff = useMemo(() => totalPaid - (totalToPay || 0), [totalPaid, totalToPay]);

  const hasChange = diff > 0;
  const hasPending = diff < 0;
  const diffLabel = hasChange ? 'Vuelto' : hasPending ? 'Pendiente' : 'Vuelto / Pendiente';

  const addRow = () => setRows(prev => [...prev, { method: 'Sinpe', amount: '', reference: '' }]);

  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx));

  const updateRow = (idx: number, patch: Partial<PaymentRow>) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const validate = () => {
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
    const err = validate();
    if (err) {
      toast({ status: 'warning', title: err, duration: 2500, isClosable: true });
      return;
    }

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
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="20px" bg={cardBg} borderWidth="1px" borderColor={border}>
        <Form isSubmitting={isSaving} onFormSubmit={(event) => { event.preventDefault(); handleSave(); }}>
        <ModalHeader>
          <Text color={textColor} fontSize="22px" fontWeight="700" noOfLines={1}>
            {title}
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={3} align="flex-end" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <FormField  label={<>Fecha de pago</>}>

                <Input type="datetime-local" value={paidAt} onChange={e => setPaidAt(e.target.value)} />
              </FormField>

              <FormField  label={<>Total a pagar</>}>

                <Input isReadOnly value={formatCRC(totalToPay)} />
              </FormField>

              <FormField  label={<>Total pagado</>}>

                <Input isReadOnly value={formatCRC(totalPaid)} />
              </FormField>

              <FormField  label={<>{diffLabel}</>}>

                <Input
                  isReadOnly
                  value={formatCRC(Math.abs(diff))}
                  color={hasChange ? 'green.500' : hasPending ? 'red.500' : undefined}
                  fontWeight="800"
                />
              </FormField>
            </HStack>

            <Divider />

            <Flex justify="space-between" align="center">
              <Text fontWeight="700" color={textColor}>
                Métodos de pago
              </Text>
              <Button type="button" leftIcon={<MdAdd />} size="sm" borderRadius="full" onClick={addRow}>
                Agregar método
              </Button>
            </Flex>

            <VStack spacing={3} align="stretch">
              {rows.map((r, idx) => {
                const needsRef = r.method === 'Sinpe' || r.method === 'Tarjeta' || r.method === 'Otro';

                const refLabel =
                  r.method === 'Sinpe'
                    ? 'Referencia SINPE'
                    : r.method === 'Tarjeta'
                    ? 'Autorización / Voucher'
                    : 'Referencia';

                return (
                  <Flex
                    key={idx}
                    gap={3}
                    p={3}
                    borderWidth="1px"
                    borderColor={border}
                    borderRadius="xl"
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'stretch', md: 'flex-end' }}
                  >
                    <FormField  label={<>Método</>}>

                      <Select
                        value={r.method}
                        onChange={e => updateRow(idx, { method: e.target.value as PaymentMethod, reference: '' })}
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Sinpe">Sinpe</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Otro">Otro</option>
                      </Select>
                    </FormField>

                    <FormField  label={<>Monto</>}>

                      <Input
                        inputMode="decimal"
                        placeholder="0"
                        value={r.amount}
                        onChange={e => updateRow(idx, { amount: e.target.value })}
                      />
                    </FormField>

                    {needsRef ? (
                      <FormField isRequired label={<>{refLabel}</>}>

                        <Input
                          placeholder={
                            r.method === 'Sinpe'
                              ? 'Ej: 123456'
                              : r.method === 'Tarjeta'
                              ? 'Ej: 9A12'
                              : 'Detalle'
                          }
                          value={r.reference || ''}
                          onChange={e => updateRow(idx, { reference: e.target.value })}
                        />
                      </FormField>
                    ) : (
                      <Box flex="1" />
                    )}

                    <FormField  label={<>Nota</>}>

                      <Input
                        placeholder="Opcional"
                        value={r.note || ''}
                        onChange={e => updateRow(idx, { note: e.target.value })}
                      />
                    </FormField>

                    <IconButton
                      type="button"
                      aria-label="Eliminar método"
                      icon={<MdDelete />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeRow(idx)}
                      isDisabled={rows.length === 1}
                    />
                  </Flex>
                );
              })}
            </VStack>

            <FormField  label={<>Nota general</>}>

              <Textarea
                placeholder="Opcional"
                value={generalNote}
                onChange={e => setGeneralNote(e.target.value)}
              />
            </FormField>

            <FormActions submitLabel="Guardar pago" isLoading={isSaving} onCancel={handleClose} showCancel />
          </VStack>
        </ModalBody>
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default PaymentModal;
