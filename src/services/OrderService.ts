import { fetchAllData, fetchAllPages, fetchDataById, addData, updateData, deleteData, db } from 'apiConfig';
import { collection, doc, getDocs, limit, query, runTransaction, where } from 'firebase/firestore';
import {OrderItem} from 'interfaces/OrderItem';

const OrderService = {
    getAllPages: () => fetchAllPages<OrderItem>('Orders'),
    getByCode: async (orderCode: string) => {
        const normalizedCode = orderCode.trim().toUpperCase();
        if (!normalizedCode) return [];
        const snapshot = await getDocs(query(
            collection(db, 'Orders'),
            where('orderCode', '==', normalizedCode),
            limit(1),
        ));
        return snapshot.docs.map(item => ({ id: item.id, ...item.data() } as OrderItem));
    },
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<OrderItem[]>(
        async (resolve, reject) => {
            try {
                const upperSearchTerm = searchTerm
                    ?.map(t => t?.trim())
                    ?.filter(Boolean)
                    ?.map(t => t!.toUpperCase());
                const data = await fetchAllData('Orders', { searchFields, searchTerm: upperSearchTerm }, 250);
                resolve(data as OrderItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<OrderItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('Orders', key);
                resolve(data as OrderItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newOrder: Omit<OrderItem, 'id'>) => new Promise<{ id: string }>(
        async (resolve, reject) => {
            try {
                const data = await addData('Orders', newOrder);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    createWithStock: async (newOrder: Omit<OrderItem, 'id'>) => {
        const requestId = newOrder.requestId?.trim();
        if (!requestId || !/^[a-zA-Z0-9_-]{16,128}$/.test(requestId)) {
            throw new Error('La solicitud no incluye una clave de idempotencia válida.');
        }
        const orderRef = doc(db, 'Orders', requestId);
        const requestedItems = newOrder.items || [];
        if (!requestedItems.length) throw new Error('El pedido debe incluir al menos un producto.');
        if (requestedItems.some(item => !item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) {
            throw new Error('Todos los productos deben tener una cantidad entera positiva.');
        }

        await runTransaction(db, async transaction => {
            const existingOrder = await transaction.get(orderRef);
            if (existingOrder.exists()) return;
            const quantitiesByProduct = requestedItems.reduce((totals, item) => {
                totals.set(item.productId!, (totals.get(item.productId!) || 0) + Number(item.quantity));
                return totals;
            }, new Map<string, number>());
            const productIds = Array.from(quantitiesByProduct.keys());
            const productRefs = productIds.map(productId => doc(db, 'Products', productId));
            const snapshots = await Promise.all(productRefs.map(productRef => transaction.get(productRef)));
            const productsById = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]));

            snapshots.forEach(snapshot => {
                if (!snapshot.exists()) throw new Error('Uno de los productos ya no existe.');
                const product = snapshot.data();
                const quantity = quantitiesByProduct.get(snapshot.id) || 0;
                const stock = Number(product.stock ?? 0);
                if (product.active === false) throw new Error(`${product.description || 'El producto'} está inactivo.`);
                if (stock < quantity) throw new Error(`Stock insuficiente para ${product.description || 'el producto'}.`);
            });

            const persistedItems = requestedItems.map(item => {
                const snapshot = productsById.get(item.productId!)!;
                const product = snapshot.data()!;
                const quantity = Number(item.quantity);
                return {
                    ...item,
                    productId: snapshot.id,
                    gasType: product.description || item.gasType,
                    quantity,
                    price: Number(product.price ?? 0),
                    unitCost: Number(product.costPrice ?? 0),
                };
            });

            snapshots.forEach((snapshot, index) => transaction.update(productRefs[index], {
                stock: Number(snapshot.data()!.stock ?? 0) - (quantitiesByProduct.get(snapshot.id) || 0),
                updatedAt: new Date().toISOString(),
            }));
            transaction.set(orderRef, {
                ...newOrder,
                requestId,
                items: persistedItems,
                totalAmount: persistedItems.reduce((total, item) => total + item.price * item.quantity, 0),
            });
        });
        return { id: orderRef.id };
    },
    edit: (key: string, editedOrder: OrderItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('Orders', key, editedOrder);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('Orders', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default OrderService;
