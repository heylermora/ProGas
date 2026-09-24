import { getPaymentMethods, isOrderLocked, normalizeOrderStatus } from './order';
import { OrderItem } from 'interfaces/OrderItem';

const order = (patch: Partial<OrderItem> = {}): OrderItem => ({
  id: '1', orderCode: 'A1', client: 'Ana', requestDate: '2026-09-24',
  location: { address: 'San José' }, status: 'Pendiente', comment: '', items: [], totalAmount: 0,
  ...patch,
});

test('normaliza los estados históricos', () => {
  expect(normalizeOrderStatus('Nuevo')).toBe('Pendiente');
  expect(normalizeOrderStatus('En proceso')).toBe('En ruta');
  expect(normalizeOrderStatus('Completado')).toBe('Entregado');
});

test('considera bloqueado un pedido marcado o liquidado', () => {
  expect(isOrderLocked(order({ locked: true }))).toBe(true);
  expect(isOrderLocked(order({ status: 'Liquidado' }))).toBe(true);
  expect(isOrderLocked(order())).toBe(false);
});

test('obtiene métodos de pago únicos', () => {
  expect(getPaymentMethods(order({ paymentMethod: 'Efectivo', payments: [
    { method: 'Efectivo', amount: 10 }, { method: 'Sinpe', amount: 20 },
  ] }))).toEqual(['Efectivo', 'Sinpe']);
});
