import { addData, db, fetchAllPages } from 'apiConfig';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { ClosingItem, ExpenseItem } from 'interfaces/ClosingItem';
import { isOrderLocked } from 'utils/order';
import { orderFingerprint } from 'utils/closing';

const ClosingService = {
  getAll: () => fetchAllPages<ClosingItem>('Closings'),
  getExpenses: () => fetchAllPages<ExpenseItem>('Expenses'),
  createExpense: (expense: Omit<ExpenseItem, 'id'>) => addData('Expenses', expense),
  confirm: async (closing: ClosingItem) => {
    const closingRef = doc(collection(db, 'Closings'));
    await runTransaction(db, async (transaction) => {
      const orderRefs = closing.orderIds.map((orderId) => doc(db, 'Orders', orderId));
      const snapshots = await Promise.all(orderRefs.map((orderRef) => transaction.get(orderRef)));
      if (snapshots.some((snapshot) => !snapshot.exists() || isOrderLocked(snapshot.data() as any))) {
        throw new Error('Uno o más pedidos ya fueron liquidados. Actualice la previsualización.');
      }
      snapshots.forEach((snapshot) => {
        const current = { id: snapshot.id, ...snapshot.data() } as any;
        if (closing.orderFingerprints[snapshot.id] !== orderFingerprint(current)) {
          throw new Error('Un pedido cambió después de la previsualización. Actualice los datos.');
        }
      });
      const expenseRefs = closing.expenseIds.map((expenseId) => doc(db, 'Expenses', expenseId));
      const expenseSnapshots = await Promise.all(expenseRefs.map((ref) => transaction.get(ref)));
      if (expenseSnapshots.some((snapshot) => !snapshot.exists() || snapshot.data().closingId)) {
        throw new Error('Uno o más gastos ya fueron incluidos en otro corte.');
      }
      transaction.set(closingRef, closing);
      orderRefs.forEach((orderRef) => transaction.update(orderRef, {
        locked: true,
        closingId: closingRef.id,
        closedAt: closing.createdAt,
      }));
      expenseRefs.forEach((expenseRef) => transaction.update(expenseRef, { closingId: closingRef.id }));
    });
    return { id: closingRef.id };
  },
};

export default ClosingService;
