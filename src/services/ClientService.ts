import { fetchAllData, addData, updateData } from 'apiConfig';
import ClientItem from 'interfaces/ClientItem';

const COLLECTION = 'Clients';

const clean = (value?: string) => String(value || '').replace(/\D/g, '');

const ClientService = {
  getByNationalId: async (nationalId: string) => {
    const term = clean(nationalId);
    if (!term) return null;

    const clients = await fetchAllData<ClientItem>(COLLECTION, {
      searchFields: ['nationalId', 'cedula', 'clientId'],
      searchTerm: [term],
    }, 10);

    return clients.find((client: any) => clean(client.nationalId || client.cedula || client.clientId) === term) || null;
  },
  create: async (client: Omit<ClientItem, 'id'>) => addData(COLLECTION, client),
  edit: async (id: string, client: ClientItem) => updateData(COLLECTION, id, client),
};

export default ClientService;
