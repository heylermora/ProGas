import { fetchAllData } from 'apiConfig'; // La función para obtener datos desde Firestore
import DashboardItem from 'interfaces/DashboardItem';

const DashboardService = {
    getAll: () => new Promise<DashboardItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchAllData('Dashboard'); // 'Dashboard' es el nombre de la colección en Firestore
                resolve(data as DashboardItem[]);
            } catch (err) {
                reject(err);
            }
        }
    ),
};

export default DashboardService;