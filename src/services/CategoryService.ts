import { fetchDataById, upsertData } from 'apiConfig';
import { PRODUCT_CATEGORIES } from 'interfaces/ProductItem';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';

export type CategoryKind = 'products' | 'sponsors';
const COLLECTION = 'CategorySettings';

const defaults: Record<CategoryKind, readonly string[]> = {
  products: PRODUCT_CATEGORIES,
  sponsors: BUSINESS_CATEGORIES,
};

const normalize = (values: unknown, fallback: readonly string[]) => {
  if (!Array.isArray(values)) return [...fallback];
  return Array.from(new Set(values.map(String).map((value) => value.trim()).filter(Boolean)));
};

const CategoryService = {
  get: async (kind: CategoryKind): Promise<string[]> => {
    try {
      const data = await fetchDataById(COLLECTION, kind) as { values?: string[] };
      return normalize(data.values, defaults[kind]);
    } catch {
      return [...defaults[kind]];
    }
  },
  save: async (kind: CategoryKind, values: string[]) => {
    const normalized = normalize(values, defaults[kind]);
    await upsertData(COLLECTION, kind, { values: normalized, updatedAt: new Date().toISOString() });
    return normalized;
  },
};

export default CategoryService;
