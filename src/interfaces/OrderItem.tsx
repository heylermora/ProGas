export interface ProductItem {
    gasType: string;
    quantity: number;
    price: number;
    comment?: string;
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
    status: string;
    comment: string;
    items: ProductItem[];
    totalAmount: number;
    onStatusChange?: (id: string, status: string) => void;
}