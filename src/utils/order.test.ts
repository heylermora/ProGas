import { addOrMergeOrderItem, getPaymentMethods, getPublicOrderStatus, isOrderLocked, isOrderPaid, normalizeOrderStatus } from './order';
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

test.each(['Pagado', 'Liquidado', 'Completado', 'Completada', 'completed'])(
  'considera %s como un estado pagado para los reportes',
  status => expect(isOrderPaid(status)).toBe(true),
);

test.each(['Pendiente', 'En ruta', 'Entregado', 'Cancelado', undefined])(
  'no considera %s como un estado pagado para los reportes',
  status => expect(isOrderPaid(status)).toBe(false),
);

test('obtiene métodos de pago únicos', () => {
  expect(getPaymentMethods(order({ paymentMethod: 'Efectivo', payments: [
    { method: 'Efectivo', amount: 10 }, { method: 'Sinpe', amount: 20 },
  ] }))).toEqual(['Efectivo', 'Sinpe']);
});

test('oculta liquidado al mostrar el estado públicamente', () => {
  expect(getPublicOrderStatus('Liquidado')).toBe('Pagado');
  expect(getPublicOrderStatus('En ruta')).toBe('En ruta');
});

test('suma cantidades del mismo producto en una sola fila', () => {
  const current = [{ productId: 'gas-b', gasType: 'Gas Tipo B', quantity: 3, price: 10000, comment: '' }];
  expect(addOrMergeOrderItem(current, {
    productId: 'gas-b', gasType: 'Gas Tipo B', quantity: 1, price: 10000, comment: '',
  })).toEqual([{ productId: 'gas-b', gasType: 'Gas Tipo B', quantity: 4, price: 10000, comment: '' }]);
});

test('mantiene filas distintas cuando cambian los datos del cilindro', () => {
  const current = [{ productId: 'gas-b', gasType: 'Gas Tipo B', quantity: 1, price: 10000, comment: '25 lb' }];
  expect(addOrMergeOrderItem(current, {
    productId: 'gas-b', gasType: 'Gas Tipo B', quantity: 1, price: 10000, comment: '100 lb',
  })).toHaveLength(2);
});
