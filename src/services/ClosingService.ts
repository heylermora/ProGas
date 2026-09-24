import { addData, db, fetchAllData } from 'apiConfig';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { ClosingItem, ExpenseItem } from 'interfaces/ClosingItem';

const ClosingService = {
  getAll: () => fetchAllData<ClosingItem>('Closings', undefined, 250),
  getExpenses: () => fetchAllData<ExpenseItem>('Expenses', undefined, 250),
  createExpense: (expense: Omit<ExpenseItem, 'id'>) => addData('Expenses', expense),
  confirm: async (closing: ClosingItem) => {
    const closingRef = doc(collection(db, 'Closings'));
    await runTransaction(db, async (transaction) => {
      const orderRefs = closing.orderIds.map((orderId) => doc(db, 'Orders', orderId));
      const snapshots = await Promise.all(orderRefs.map((orderRef) => transaction.get(orderRef)));
      if (snapshots.some((snapshot) => !snapshot.exists() || snapshot.data().locked)) {
        throw new Error('Uno o más pedidos ya fueron incluidos en otro corte. Actualice la previsualización.');
      }
      transaction.set(closingRef, closing);
      orderRefs.forEach((orderRef) => transaction.update(orderRef, {
        locked: true,
        closingId: closingRef.id,
        closedAt: closing.createdAt,
      }));
    });
    return { id: closingRef.id };
  },
};

export default ClosingService;
