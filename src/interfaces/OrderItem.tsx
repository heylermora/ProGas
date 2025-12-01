export interface ProductItem {
    productId: string;
    name: string;
    gasType: string;
    quantity: number;
    price: number;
    comment?: string;
}

interface OrderItem {
    id: string;
    orderCode: string;
    client: string;
    requestDate: string;
    location: string;
    status: string;
    comment: string;
    items: ProductItem[];
}

export default OrderItem;