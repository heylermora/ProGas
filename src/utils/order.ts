import { OrderItem, OrderStatus } from 'interfaces/OrderItem';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pendiente', 'En ruta', 'Entregado', 'Pagado', 'Liquidado', 'Cancelado',
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

export const isOrderLocked = (order: Pick<OrderItem, 'locked' | 'status'>) =>
  Boolean(order.locked) || normalizeOrderStatus(order.status) === 'Liquidado';

export const getPaymentMethods = (order: OrderItem) => {
  const methods = (order.payments || []).map(payment => payment.method);
  if (order.paymentMethod) methods.push(order.paymentMethod);
  return Array.from(new Set(methods));
};
