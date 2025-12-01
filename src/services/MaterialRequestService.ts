import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import MaterialRequestItem from 'interfaces/MaterialRequestItem';

const MaterialRequestService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<MaterialRequestItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('MaterialRequests', { searchFields, searchTerm });
                resolve(data as MaterialRequestItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<MaterialRequestItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('MaterialRequests', key );
                resolve(data as MaterialRequestItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newMaterialRequest: MaterialRequestItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('MaterialRequests', newMaterialRequest);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedMaterialRequest: MaterialRequestItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('MaterialRequests', key, editedMaterialRequest);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('MaterialRequests', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default MaterialRequestService;