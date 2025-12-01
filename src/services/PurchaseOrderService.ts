import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import PurchaseOrderItem from 'interfaces/PurchaseOrderItem';

const PurchaseOrderService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<PurchaseOrderItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('PurchaseOrders', { searchFields, searchTerm });
                resolve(data as PurchaseOrderItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<PurchaseOrderItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('PurchaseOrders', key );
                resolve(data as PurchaseOrderItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newPurchaseOrder: PurchaseOrderItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('PurchaseOrders', newPurchaseOrder);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedPurchaseOrder: PurchaseOrderItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('PurchaseOrders', key, editedPurchaseOrder);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('PurchaseOrders', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default PurchaseOrderService;