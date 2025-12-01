import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import PayRollItem from 'interfaces/PayRollItem';

const PayRollService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<PayRollItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('PayRolls', { searchFields, searchTerm });
                resolve(data as PayRollItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<PayRollItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('PayRolls', key );
                resolve(data as PayRollItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newPayRoll: PayRollItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('PayRolls', newPayRoll);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedPayRoll: PayRollItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('PayRolls', key, editedPayRoll);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('PayRolls', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default PayRollService;