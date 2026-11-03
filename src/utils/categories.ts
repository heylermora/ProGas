import { v5 as uuid } from 'uuid';

export type CategoryRecord = { id: string; name: string; aliases: string[] };
export const compareCategories = new Intl.Collator('es-CR', { sensitivity: 'base', numeric: true }).compare;
export const sortCategories = (values: readonly string[]) => Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).sort(compareCategories);
export const categoryId = (kind: string, name: string) => uuid(`progas:${kind}:${name}`, uuid.URL);
export const sortCatalog = (records: CategoryRecord[]) => [...records].sort((a, b) => compareCategories(a.name, b.name));
export const findCategory = (records: CategoryRecord[], name: string) => records.find(record => record.name === name.trim() || record.aliases.includes(name.trim()));
export function completeCatalog(kind: string, names: readonly string[], records: CategoryRecord[] = []): CategoryRecord[] {
  const result = records.map(record => ({ ...record, aliases: Array.from(new Set(record.aliases || [])) }));
  sortCategories(names).forEach(name => { if (!findCategory(result, name)) result.push({ id: categoryId(kind, name), name, aliases: [] }); });
  return sortCatalog(result);
}
export function renameCategory(records: CategoryRecord[], id: string, name: string): CategoryRecord[] {
  const next = name.trim();
  if (!next) throw new Error('Ingresá un nombre.');
  if (records.some(record => record.id !== id && [record.name, ...record.aliases].some(value => compareCategories(value, next) === 0))) throw new Error('Ese nombre ya pertenece a otra categoría.');
  return sortCatalog(records.map(record => record.id === id ? { ...record, name: next, aliases: Array.from(new Set([...record.aliases, record.name])).filter(value => value !== next) } : record));
}
export function resolveCategory<T extends { category: string; categoryId?: string }>(item: T, records: CategoryRecord[]): T {
  const record = item.categoryId ? records.find(record => record.id === item.categoryId) : findCategory(records, item.category);
  return record ? { ...item, categoryId: record.id, category: record.name } : item;
}
