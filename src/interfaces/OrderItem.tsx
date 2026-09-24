export interface ProductItem {
    productId?: string;
    gasType: string;
    quantity: number;
    price: number;
    comment?: string;
}

export type OrderStatus = 'Pendiente' | 'En ruta' | 'Entregado' | 'Pagado' | 'Liquidado' | 'Cancelado';

export interface OrderPayment {
    method: 'Efectivo' | 'Sinpe' | 'Tarjeta' | 'Otro';
    amount: number;
    reference?: string | null;
    note?: string | null;
}

export interface OrderItem {
    id: string;
    orderCode: string;
    client: string;
    clientId?: string; // cédula / identificación del cliente (opcional)
    requestDate: string;
    location: {
        address: string;
        lat?: number;
        lng?: number;
    }
    status: OrderStatus | string;
    comment: string;
    items: ProductItem[];
    totalAmount: number;
    paymentMethod?: string;
    payments?: OrderPayment[];
    totalPaid?: number;
    paidAt?: string;
    paymentNote?: string | null;
    locked?: boolean;
    onStatusChange?: (id: string, status: string) => void;
}
