import { fetchDataWithFilters } from 'apiConfig'; // La función para obtener datos desde Firestore
import ExchangeRateItem from 'interfaces/ExchangeRateItem';

const ExchangeRateService = {
    get: (startDate: string, endDate: string) => new Promise<ExchangeRateItem[]>(
        async (resolve, reject) => {
            try {
                const data = await fetchDataWithFilters('ExchangeRate', {
                    searchFields: ['date'],
                    searchTerms: [startDate, endDate]
                });
                resolve(data as ExchangeRateItem[]);
            } catch (err) {
                reject(err);
            }
        }
    )
};

export default ExchangeRateService;