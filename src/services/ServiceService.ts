import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig'; // Funciones auxiliares para Firestore
import ServiceItem from 'interfaces/ServiceItem';

const ServiceService = {
    getAll: (searchFields?: string[], searchTerm?: string[]) => new Promise<ServiceItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Services', { searchFields, searchTerm });
                resolve(data as ServiceItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
    get: (key: string) => new Promise<ServiceItem>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataById('Services', key );
                resolve(data as ServiceItem);
            } catch (err) {
                reject(err);
            }
        }
    ),
    create: (newService: ServiceItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await addData('Services', newService);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    edit: (key: string, editedService: ServiceItem) => new Promise<any>(
        async (resolve, reject) => {
            try {
                const data = await updateData('Services', key, editedService);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    ),
    delete: (key: string) => new Promise<void>(
        async (resolve, reject) => {
            try {
                await deleteData('Services', key);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default ServiceService;