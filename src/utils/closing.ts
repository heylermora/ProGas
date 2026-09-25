import { OrderItem } from 'interfaces/OrderItem';
import { CylinderLine, ExpenseItem } from 'interfaces/ClosingItem';
import { Product } from 'interfaces/ProductItem';
import { isOrderLocked, isOrderPaid } from './order';

export const money = (value: unknown) => Number(value || 0) || 0;

export const orderTotal = (order: OrderItem) =>
  money(order.totalAmount) || order.items.reduce((sum, item) => sum + money(item.price) * money(item.quantity), 0);

export const parseStoredDate = (value: string) => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime()
    : new Date(value).getTime();
};

export const orderFingerprint = (order: OrderItem) => JSON.stringify({
  status: order.status, locked: Boolean(order.locked), paidAt: order.paidAt || null,
  totalAmount: money(order.totalAmount), change: money(order.change),
  payments: order.payments || order.paymentMethods || order.paymentDetails || [], items: order.items,
});

export const availableOrders = (orders: OrderItem[], from: string, to: string) => {
  const start = parseStoredDate(from);
  const end = parseStoredDate(to);
  return orders.filter((order) => {
    const date = parseStoredDate(order.paidAt || order.requestDate);
    return isOrderPaid(order.status) && !isOrderLocked(order) && date >= start && date <= end;
  });
};

export const paymentTotals = (orders: OrderItem[]) => {
  const totals = { cash: 0, sinpe: 0, other: 0 };
  orders.forEach((order) => {
    const legacyPayments = order.payments || order.paymentMethods || order.paymentDetails;
    const payments = legacyPayments?.length
      ? legacyPayments
      : [{ method: order.paymentMethod || 'Otro', amount: orderTotal(order) }];
    payments.forEach((payment) => {
      const method = String(payment.method).toLowerCase();
      if (method === 'efectivo') totals.cash += money(payment.amount);
      else if (method === 'sinpe') totals.sinpe += money(payment.amount);
      else totals.other += money(payment.amount);
    });
    totals.cash -= money(order.change);
  });
  return totals;
};

export const expenseTotal = (expenses: ExpenseItem[], from: string, to: string) => {
  const start = parseStoredDate(from);
  const end = parseStoredDate(to);
  return expenses.reduce((sum, expense) => {
    const date = new Date(expense.occurredAt).getTime();
    return !expense.closingId && date >= start && date <= end ? sum + money(expense.amount) : sum;
  }, 0);
};

export const availableExpenses = (expenses: ExpenseItem[], from: string, to: string) => {
  const start = parseStoredDate(from);
  const end = parseStoredDate(to);
  return expenses.filter((expense) => !expense.closingId && parseStoredDate(expense.occurredAt) >= start && parseStoredDate(expense.occurredAt) <= end);
};

export const cylinderSummary = (orders: OrderItem[], products: Product[]): CylinderLine[] => {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines = new Map<string, CylinderLine>();
  orders.forEach((order) => order.items.forEach((item) => {
    const product = productsById.get(item.productId || '') || products.find((candidate) =>
      candidate.description.trim().toLocaleLowerCase('es') === item.gasType.trim().toLocaleLowerCase('es'));
    if (!product || product.category !== 'Cilindros') return;
    const key = product.id;
    const current = lines.get(key) || {
      productId: key,
      type: product.description,
      size: item.gasType || product.sku || 'Sin especificar',
      quantity: 0,
      unitCost: item.unitCost == null ? money(product.costPrice) : money(item.unitCost),
      totalCost: 0,
    };
    current.quantity += money(item.quantity);
    current.totalCost = current.quantity * current.unitCost;
    lines.set(key, current);
  }));
  return Array.from(lines.values());
};
