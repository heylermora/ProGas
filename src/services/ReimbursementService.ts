import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import ReimbursementItem from 'interfaces/ReimbursementItem';

const ReimbursementService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<ReimbursementItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Reimbursements', { searchFields, searchTerm });
                resolve(data as ReimbursementItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<ReimbursementItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('Reimbursements', key );
                resolve(data as ReimbursementItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newReimbursement: ReimbursementItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('Reimbursements', newReimbursement);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedReimbursement: ReimbursementItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('Reimbursements', key, editedReimbursement);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('Reimbursements', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default ReimbursementService;