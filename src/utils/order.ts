import { OrderItem, OrderStatus } from 'interfaces/OrderItem';
import type { ProductItem } from 'interfaces/OrderItem';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pendiente', 'En ruta', 'Entregado', 'Pagado', 'Liquidado', 'Cancelado',
];

export const SELECTABLE_ORDER_STATUSES: OrderStatus[] = [
  'Pendiente', 'En ruta', 'Entregado', 'Pagado', 'Cancelado',
];

const LEGACY_STATUS: Record<string, OrderStatus> = {
  Nuevo: 'Pendiente',
  'En proceso': 'En ruta',
  Completado: 'Entregado',
};

export const normalizeOrderStatus = (status?: string): OrderStatus =>
  ORDER_STATUSES.includes(status as OrderStatus)
    ? status as OrderStatus
    : LEGACY_STATUS[status || ''] || 'Pendiente';

/**
 * The closing state is an internal accounting detail. Customers only need to
 * know that their payment was registered, so it must never leak into public UI.
 */
export const getPublicOrderStatus = (status?: string): Exclude<OrderStatus, 'Liquidado'> => {
  const normalized = normalizeOrderStatus(status);
  return normalized === 'Liquidado' ? 'Pagado' : normalized;
};

export const addOrMergeOrderItem = (items: ProductItem[], incoming: ProductItem): ProductItem[] => {
  const matchingIndex = items.findIndex(item =>
    item.productId === incoming.productId
    && item.price === incoming.price
    && (item.comment || '').trim() === (incoming.comment || '').trim(),
  );

  if (matchingIndex < 0) return [...items, incoming];

  return items.map((item, index) => index === matchingIndex
    ? { ...item, quantity: item.quantity + incoming.quantity }
    : item);
};

export const isOrderLocked = (order: Pick<OrderItem, 'locked' | 'status'>) =>
  Boolean(order.locked) || normalizeOrderStatus(order.status) === 'Liquidado';

export const isOrderPaid = (status?: string | null) => {
  const normalizedStatus = String(status || '').trim().toLocaleLowerCase('es');
  return ['pagado', 'liquidado', 'completado', 'completada', 'completed'].includes(normalizedStatus);
};

export const getPaymentMethods = (order: OrderItem) => {
  const methods = (order.payments || []).map(payment => payment.method);
  if (order.paymentMethod) methods.push(order.paymentMethod);
  return Array.from(new Set(methods));
};
