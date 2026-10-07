import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PaymentModal from './PaymentModal';

describe('compact payment modal', () => {
  it('reveals an invalid method and preserves all payment details when saving', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    render(<ChakraProvider><PaymentModal id="order-test" totalToPay={10000} isOpen onClose={jest.fn()} onSave={save}
      initialNote="Pago del cliente" initialPayments={[{ method: 'Efectivo', amount: 4000, note: 'Caja' }, { method: 'Sinpe', amount: 6000, reference: '987' }]} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('button', { name: /2\. Sinpe/ }));
    fireEvent.change(screen.getByRole('textbox', { name: /Referencia SINPE/ }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar pago' }));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Ingrese la referencia del pago.')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: /Referencia SINPE/ }), { target: { value: '987' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar pago' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ totalPaid: 10000, note: 'Pago del cliente', payments: [
      { method: 'Efectivo', amount: 4000, note: 'Caja', reference: null },
      { method: 'Sinpe', amount: 6000, reference: '987', note: null },
    ] })));
  });
});
