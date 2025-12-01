import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import OrderItem from 'interfaces/OrderItem';

const OrderService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<OrderItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Orders', { searchFields, searchTerm });
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
    create: (newOrder: OrderItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('Orders', newOrder);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
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