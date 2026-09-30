import { fetchAllData, fetchAllPages, fetchDataById, addData, updateData, deleteData, db } from 'apiConfig';
import { doc, runTransaction } from 'firebase/firestore';
import ProductItem from 'interfaces/ProductItem';

const ProductService = {
  getAllPages: () => fetchAllPages<ProductItem>('Products'),
  getAll: (searchFields?: string[], searchTerm?: string[]) =>
    new Promise<ProductItem[]>(async (resolve, reject) => {
      try {
        const upperSearchTerm = searchTerm
          ?.map(t => t?.trim())
          ?.filter(Boolean)
          ?.map(t => t!.toUpperCase());

        const data = await fetchAllData('Products', {
          searchFields,
          searchTerm: upperSearchTerm
        }, 250);

        resolve(data as ProductItem[]);
      } catch (err) {
        reject(err);
      }
    }),

  get: (key: string) =>
    new Promise<ProductItem>(async (resolve, reject) => {
      try {
        const data = await fetchDataById('Products', key);
        resolve(data as ProductItem);
      } catch (err) {
        reject(err);
      }
    }),

  create: (newProduct: Omit<ProductItem, 'id'>) =>
    new Promise<{ id: string }>(async (resolve, reject) => {
      try {
        const data = await addData('Products', newProduct);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    }),

  edit: (key: string, editedProduct: ProductItem) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        const data = await updateData('Products', key, editedProduct);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    }),

  adjustStock: async (key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new Error('El ajuste debe ser un número entero distinto de cero.');
    }
    const productRef = doc(db, 'Products', key);
    return runTransaction(db, async transaction => {
      const snapshot = await transaction.get(productRef);
      if (!snapshot.exists()) throw new Error('El producto no existe.');
      const nextStock = Number(snapshot.data().stock ?? 0) + quantity;
      if (nextStock < 0) throw new Error('El ajuste dejaría el inventario en negativo.');
      transaction.update(productRef, {
        stock: nextStock,
        updatedAt: new Date().toISOString(),
      });
      return nextStock;
    });
  },

  delete: (key: string) =>
    new Promise<void>(async (resolve, reject) => {
      try {
        await deleteData('Products', key);
        resolve();
      } catch (err) {
        reject(err);
      }
    })
};

export default ProductService;
