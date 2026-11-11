import SponsorItem, { DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';
import { CategoryRecord, findCategory } from './categories';

type CategorizedBusiness = Pick<SponsorItem, 'category' | 'categoryId' | 'categories' | 'categoryIds'>;

export function sponsorCategories(item: CategorizedBusiness): string[] {
  const values = Array.isArray(item.categories) ? item.categories : [item.category || DEFAULT_BUSINESS_CATEGORY];
  return Array.from(new Set(values.filter(value => typeof value === 'string').map(value => value.trim()).filter(Boolean)));
}

export const hasSponsorCategory = (item: CategorizedBusiness, name: string) => sponsorCategories(item).includes(name);

export function resolveSponsorCategories<T extends CategorizedBusiness>(item: T, catalog: CategoryRecord[]): T & { categoryId: string; categories: string[]; categoryIds: string[] } {
  const names = Array.isArray(item.categories) ? item.categories : [item.category || DEFAULT_BUSINESS_CATEGORY];
  const ids = Array.isArray(item.categoryIds) ? item.categoryIds : [item.categoryId];
  const records = names.map((name, index) => {
    if (typeof name !== 'string' || !name.trim()) return undefined;
    return ids[index]
      ? catalog.find(record => record.id === ids[index]) || { id: ids[index], name: name.trim(), aliases: [] }
      : findCategory(catalog, name);
  });
  const resolved = records.filter((record, index) => record && records.findIndex(other => other?.id === record.id) === index);
  if (!resolved.length) throw new Error('Seleccione al menos una categoría específica.');
  return { ...item, category: resolved[0].name, categoryId: resolved[0].id, categories: resolved.map(record => record.name), categoryIds: resolved.map(record => record.id) };
}
