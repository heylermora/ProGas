import { addData, deleteData, fetchAllData } from 'apiConfig';

export type OperationKind = 'Sinpe' | 'Tarjeta' | 'Proveedor';

export interface OperationRow {
  id: string;
  kind: OperationKind;
  description: string;
  amount: number;
}

export interface Closing {
  id?: string;
  date: string;
  createdAt: string;
  rows: OperationRow[];
  totals: Record<OperationKind, number>;
  grandTotal: number;
}

export interface Provider {
  id?: string;
  name: string;
}

const OperationsService = {
  getClosings: () => fetchAllData<Closing>('OperationClosings', undefined, 250),
  saveClosing: (closing: Closing) => addData('OperationClosings', closing),
  getProviders: () => fetchAllData<Provider>('OperationProviders', undefined, 250),
  addProvider: (name: string) => addData('OperationProviders', { name }),
  deleteProvider: (id: string) => deleteData('OperationProviders', id),
};

export default OperationsService;
