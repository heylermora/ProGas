import { availableOrders, cylinderSummary, paymentTotals } from './closing';

const order: any = { id: '1', requestDate: '2026-09-24T10:00:00Z', status: 'Pagado', locked: false,
  totalAmount: 15000, payments: [{ method: 'Efectivo', amount: 10000 }, { method: 'Sinpe', amount: 5000 }],
  items: [{ productId: 'p1', gasType: '25 lb', quantity: 2, price: 7500 }] };

test('excludes locked orders and totals payment methods', () => {
  expect(availableOrders([order, { ...order, id: '2', locked: true }], '2026-09-24', '2026-09-24T23:59:59')).toHaveLength(1);
  expect(paymentTotals([order])).toEqual({ cash: 10000, sinpe: 5000, other: 0 });
});

test('summarizes only cylinder products at cost', () => {
  const lines = cylinderSummary([order], [{ id: 'p1', description: 'Cilindro Tropigas', category: 'Cilindros', costPrice: 5000 } as any]);
  expect(lines[0]).toMatchObject({ quantity: 2, unitCost: 5000, totalCost: 10000 });
});
