import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import InvoiceItem from 'interfaces/InvoiceItem';

const InvoiceService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<InvoiceItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Invoices', { searchFields, searchTerm });
                resolve(data as InvoiceItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<InvoiceItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('Invoices', key );
                resolve(data as InvoiceItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newInvoice: InvoiceItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('Invoices', newInvoice);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedInvoice: InvoiceItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('Invoices', key, editedInvoice);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('Invoices', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default InvoiceService;