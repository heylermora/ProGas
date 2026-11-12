import { fetchAllPages, fetchDataById, upsertData } from 'apiConfig';
import { PRODUCT_CATEGORIES } from 'interfaces/ProductItem';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';
import { BusinessCategorySettings, completeBusinessSettings, defaultBusinessSettings } from 'utils/businessCategories';
import { CategoryRecord, completeCatalog, findCategory, renameCategory, resolveCategory, sortCategories } from 'utils/categories';

export type CategoryKind = 'products' | 'sponsors';
const COLLECTION = 'CategorySettings';
const defaults = { products: PRODUCT_CATEGORIES, sponsors: BUSINESS_CATEGORIES };
type SettingsDocument = { values?: string[]; catalog?: CategoryRecord[]; businessSettings?: BusinessCategorySettings };
const read = async (kind: CategoryKind): Promise<SettingsDocument> => {
  try { return (await fetchDataById(COLLECTION, kind) as SettingsDocument) || {}; }
  catch (error) {
    if (error instanceof Error && error.message.includes('Documento no encontrado')) return {};
    throw error;
  }
};
const catalogFor = (kind: CategoryKind, data: SettingsDocument, extra: string[] = []) => completeCatalog(kind, [...(data.values || defaults[kind]), ...extra], data.catalog || data.businessSettings?.catalog);
const validate = (records: CategoryRecord[]) => {
  const ids = new Set<string>();
  records.forEach(record => {
    if (!record.id || !record.name.trim() || ids.has(record.id)) throw new Error('La categoría no es válida.');
    ids.add(record.id);
    renameCategory(records, record.id, record.name);
  });
};
export class CategoryInUseError extends Error {
  constructor(public readonly category: string) {
    super(`No se puede eliminar la categoría “${category}” porque tiene valores asociados.`);
    this.name = 'CategoryInUseError';
  }
}

type AssociatedItem = { category?: string; categoryId?: string; categories?: string[]; categoryIds?: string[]; type?: string };
const assertUnused = async (kind: CategoryKind, names: string[], catalog?: CategoryRecord[]) => {
  if (!names.length) return;
  const records = catalog || await CategoryService.getCatalog(kind);
  const items = await fetchAllPages<AssociatedItem>(kind === 'products' ? 'Products' : 'Sponsors');
  const used = names.find(name => {
    const record = findCategory(records, name);
    return items.some(item => {
      const ids = [...(item.categoryIds || []), item.categoryId].filter(Boolean);
      const legacy = kind === 'sponsors' ? ({ VIP: 'Restaurantes/Sodas', Premium: 'Tiendas', General: 'Otros' }[item.type || 'General'] || 'Otros') : '';
      const values = [...(item.categories || []), item.category || legacy];
      return (record && ids.includes(record.id)) || values.some(value => value && (value === name || (record && (record.aliases.includes(value) || findCategory(records, value)?.id === record.id))));
    });
  });
  if (used) throw new CategoryInUseError(used);
};
const assertCatalogRemoval = async (kind: CategoryKind, previous: CategoryRecord[], next: CategoryRecord[]) => {
  await assertUnused(kind, previous.filter(record => !next.some(item => item.id === record.id)).map(record => record.name), previous);
};

const CategoryService = {
  assertUnused,
  getCatalog: async (kind: CategoryKind, extra: string[] = []): Promise<CategoryRecord[]> => catalogFor(kind, await read(kind), extra),
  get: async (kind: CategoryKind): Promise<string[]> => (await CategoryService.getCatalog(kind)).map(record => record.name),
  getBusinessSettings: async (categories: string[]): Promise<BusinessCategorySettings> => {
    const data = await read('sponsors');
    const catalog = catalogFor('sponsors', data, categories);
    return completeBusinessSettings(categories, { ...(data.businessSettings || defaultBusinessSettings(catalog.map(record => record.name))), catalog });
  },
  saveBusinessSettings: async (values: string[], settings: BusinessCategorySettings) => {
    const normalized = completeBusinessSettings(values, settings);
    validate(normalized.catalog);
    const previous = await CategoryService.getBusinessSettings([]);
    await assertCatalogRemoval('sponsors', previous.catalog, normalized.catalog);
    const usedGroup = previous.groups.find(group => !normalized.groups.some(item => item.id === group.id)
      && group.categories.some(name => normalized.catalog.some(record => record.id === findCategory(previous.catalog, name)?.id)));
    if (usedGroup) throw new CategoryInUseError(usedGroup.name);
    const groups = normalized.groups.map(({ categories, ...group }) => ({ ...group, categoryIds: categories.map(name => findCategory(normalized.catalog, name).id) }));
    await upsertData(COLLECTION, 'sponsors', { values: normalized.catalog.map(record => record.name), catalog: normalized.catalog, businessSettings: { groups, icons: Object.fromEntries(normalized.catalog.map(record => [record.id, normalized.icons[record.name]])) }, updatedAt: new Date().toISOString() });
  },
  save: async (kind: CategoryKind, values: string[], renames: Record<string, string> = {}) => {
    let records = await CategoryService.getCatalog(kind);
    const previous = records;
    Object.entries(renames).forEach(([before, after]) => {
      const record = findCategory(records, before);
      if (record) records = renameCategory(records, record.id, after);
    });
    const names = sortCategories(values);
    records = completeCatalog(kind, names, records.filter(record => names.includes(record.name)));
    validate(records);
    await assertCatalogRemoval(kind, previous, records);
    await upsertData(COLLECTION, kind, { values: records.map(record => record.name), catalog: records, updatedAt: new Date().toISOString() });
    return records.map(record => record.name);
  },
  resolveItem: async <T extends { category: string; categoryId?: string }>(kind: CategoryKind, item: T): Promise<T> => resolveCategory(item, await CategoryService.getCatalog(kind, [item.category])),
};
export default CategoryService;
