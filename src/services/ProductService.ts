import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig';
import ProductItem from 'interfaces/ProductItem';

const ProductService = {
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
        });

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