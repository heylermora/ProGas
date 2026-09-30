import OrderService from './OrderService';
import { runTransaction } from 'firebase/firestore';

jest.mock('apiConfig', () => ({
  db: {},
  fetchAllData: jest.fn(),
  fetchAllPages: jest.fn(),
  fetchDataById: jest.fn(),
  addData: jest.fn(),
  updateData: jest.fn(),
  deleteData: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db, name) => ({ name })),
  doc: jest.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDocs: jest.fn(),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  runTransaction: jest.fn(),
}));

const mockedTransaction = runTransaction as jest.Mock;
const order = {
  requestId: 'request_1234567890',
  orderCode: 'ABC123456789',
  client: 'Cliente',
  requestDate: '2026-09-30T12:00:00.000Z',
  location: { address: 'Acosta' },
  status: 'Nuevo',
  comment: '',
  items: [{ productId: 'p1', gasType: 'Gas', quantity: 1, price: 1 }],
  totalAmount: 1,
};

describe('OrderService.createWithStock idempotency', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the same order without changing stock when requestId already exists', async () => {
    const transaction = {
      get: jest.fn().mockResolvedValue({ exists: () => true }),
      set: jest.fn(),
      update: jest.fn(),
    };
    mockedTransaction.mockImplementation(async (_db, callback) => callback(transaction));

    await expect(OrderService.createWithStock(order)).resolves.toEqual({ id: order.requestId });
    expect(transaction.get).toHaveBeenCalledTimes(1);
    expect(transaction.update).not.toHaveBeenCalled();
    expect(transaction.set).not.toHaveBeenCalled();
  });

  it('rejects requests without a reusable idempotency key', async () => {
    await expect(OrderService.createWithStock({ ...order, requestId: undefined })).rejects.toThrow('idempotencia');
    expect(mockedTransaction).not.toHaveBeenCalled();
  });
});
