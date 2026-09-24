import { OrderItem } from 'interfaces/OrderItem';
import { CylinderLine, ExpenseItem } from 'interfaces/ClosingItem';
import { Product } from 'interfaces/ProductItem';
import { isOrderPaid } from './order';

export const money = (value: unknown) => Number(value || 0) || 0;

export const orderTotal = (order: OrderItem) =>
  money(order.totalAmount) || order.items.reduce((sum, item) => sum + money(item.price) * money(item.quantity), 0);

export const availableOrders = (orders: OrderItem[], from: string, to: string) => {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return orders.filter((order) => {
    const date = new Date(order.paidAt || order.requestDate).getTime();
    return isOrderPaid(order.status) && !order.locked && date >= start && date <= end;
  });
};

export const paymentTotals = (orders: OrderItem[]) => {
  const totals = { cash: 0, sinpe: 0, other: 0 };
  orders.forEach((order) => {
    const payments = order.payments?.length
      ? order.payments
      : [{ method: order.paymentMethod || 'Otro', amount: orderTotal(order) }];
    payments.forEach((payment) => {
      const method = String(payment.method).toLowerCase();
      if (method === 'efectivo') totals.cash += money(payment.amount);
      else if (method === 'sinpe') totals.sinpe += money(payment.amount);
      else totals.other += money(payment.amount);
    });
  });
  return totals;
};

export const expenseTotal = (expenses: ExpenseItem[], from: string, to: string) => {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return expenses.reduce((sum, expense) => {
    const date = new Date(expense.occurredAt).getTime();
    return date >= start && date <= end ? sum + money(expense.amount) : sum;
  }, 0);
};

export const cylinderSummary = (orders: OrderItem[], products: Product[]): CylinderLine[] => {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines = new Map<string, CylinderLine>();
  orders.forEach((order) => order.items.forEach((item) => {
    const product = productsById.get(item.productId || '');
    if (!product || product.category !== 'Cilindros') return;
    const key = product.id;
    const current = lines.get(key) || {
      productId: key,
      type: product.description,
      size: item.gasType || product.sku || 'Sin especificar',
      quantity: 0,
      unitCost: money(product.costPrice),
      totalCost: 0,
    };
    current.quantity += money(item.quantity);
    current.totalCost = current.quantity * current.unitCost;
    lines.set(key, current);
  }));
  return Array.from(lines.values());
};
