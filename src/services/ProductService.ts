import { fetchAllData, fetchAllPages, fetchDataById, addData, updateData, deleteData } from 'apiConfig';
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
    const product = await ProductService.get(key);
    const nextStock = Math.max(0, Number(product.stock ?? 0) + quantity);
    await updateData('Products', key, {
      stock: nextStock,
      updatedAt: new Date().toISOString(),
    });
    return nextStock;
  },

  discountStock: async (items: Array<{ productId?: string; quantity: number }>) => {
    const trackedItems = items.filter(item => item.productId && Number(item.quantity) > 0);
    const currentProducts = await Promise.all(
      trackedItems.map(item => ProductService.get(item.productId!))
    );

    currentProducts.forEach((product, index) => {
      const requested = Number(trackedItems[index].quantity);
      if (product.active === false) throw new Error(`${product.description} está inactivo`);
      if (Number(product.stock ?? 0) < requested) {
        throw new Error(`Stock insuficiente para ${product.description}`);
      }
    });

    await Promise.all(currentProducts.map((product, index) =>
      updateData('Products', product.id, {
        stock: Number(product.stock ?? 0) - Number(trackedItems[index].quantity),
        updatedAt: new Date().toISOString(),
      })
    ));
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
