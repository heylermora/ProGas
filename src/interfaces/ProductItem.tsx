export const PRODUCT_CATEGORIES = [
  'Gas',
  'Cilindros',
  'Recargas',
  'Mangueras',
  'Reguladores',
  'Fitería/accesorios',
  'Combos',
  'Otros',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export interface Product {
  id: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  category: ProductCategory;
  active: boolean;
  sku?: string;
  lowStockThreshold?: number;
  updatedAt?: string;
}

type ProductItem = Product;

export default ProductItem;
