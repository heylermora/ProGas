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

test('treats date-only payments as local dates and excludes Liquidado orders', () => {
  const paidOnDate = { ...order, paidAt: '2026-09-24' };
  expect(availableOrders([paidOnDate], '2026-09-24T00:00', '2026-09-24T23:59')).toHaveLength(1);
  expect(availableOrders([{ ...paidOnDate, status: 'Liquidado' }], '2026-09-24T00:00', '2026-09-24T23:59')).toHaveLength(0);
});

test('supports legacy split payments and subtracts cash change', () => {
  const legacy = {
    ...order,
    payments: undefined,
    paymentMethods: [{ method: 'Efectivo', amount: 20000 }, { method: 'Sinpe', amount: 5000 }],
    change: 5000,
  };
  expect(paymentTotals([legacy])).toEqual({ cash: 15000, sinpe: 5000, other: 0 });
});

test('uses the sale-time unit cost for cylinder summaries', () => {
  const sold = { ...order, items: [{ ...order.items[0], unitCost: 4200 }] };
  const lines = cylinderSummary([sold], [{ id: 'p1', description: 'Cilindro Tropigas', category: 'Cilindros', costPrice: 9000 } as any]);
  expect(lines[0].totalCost).toBe(8400);
});
