import { fetchAllData, addData, updateData, db } from 'apiConfig';
import { doc, runTransaction } from 'firebase/firestore';
import ClientItem from 'interfaces/ClientItem';

const COLLECTION = 'Clients';

const clean = (value?: string) => String(value || '').replace(/\D/g, '');
const publicClientId = async (nationalId: string) => {
  const bytes = new TextEncoder().encode(nationalId);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `client_${Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

const ClientService = {
  getAll: async () => fetchAllData<ClientItem>(COLLECTION, undefined, 250),
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
  createPublic: async (client: Omit<ClientItem, 'id'>) => {
    const nationalId = clean(client.nationalId);
    if (!nationalId) throw new Error('La cédula es requerida.');
    const clientId = await publicClientId(nationalId);
    const clientRef = doc(db, COLLECTION, clientId);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(clientRef);
      if (snapshot.exists()) throw new Error('No se pudo completar la verificación del cliente.');
      transaction.set(clientRef, {
        ...client,
        nationalId,
        phone: clean(client.phone),
        createdAt: new Date().toISOString(),
      });
    });
    return { id: clientId };
  },
  edit: async (id: string, client: ClientItem) => updateData(COLLECTION, id, client),
};

export default ClientService;
