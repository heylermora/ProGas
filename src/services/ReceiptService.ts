import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import ReceiptItem from 'interfaces/ReceiptItem';

const ReceiptService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<ReceiptItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Receipts', { searchFields, searchTerm });
                resolve(data as ReceiptItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<ReceiptItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('Receipts', key );
                resolve(data as ReceiptItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newReceipt: ReceiptItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('Receipts', newReceipt);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedReceipt: ReceiptItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('Receipts', key, editedReceipt);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('Receipts', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default ReceiptService;