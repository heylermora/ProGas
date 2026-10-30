import { CategoryRecord, categoryId, compareCategories, completeCatalog, findCategory, sortCategories } from './categories';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';

export type BusinessCategoryGroup = { id?: string; name: string; icon: string; categories: string[]; categoryIds?: string[] };
export type BusinessCategorySettings = { groups: BusinessCategoryGroup[]; icons: Record<string, string>; catalog?: CategoryRecord[] };
const definitions: [string, string, number[]][] = [
  ['Alimentos / Bebidas', '🍽️', [0, 1, 2, 3, 4, 5]],
  ['Compras', '🛍️', [6, 7, 8, 9]],
  ['Belleza y bienestar', '✨', [10, 11, 16]],
  ['Salud y mascotas', '🐾', [12, 13]],
  ['Hogar y agro', '🌱', [14, 15, 19]],
  ['Vehículos y talleres', '🔧', [17, 18]],
  ['Otros', '🏪', [20]],
];
const initialBusinessSettings = (categories: string[]): BusinessCategorySettings => ({
  groups: definitions.map(([name, icon, indexes]) => ({ name, icon, categories: categories.filter(category => indexes.some(index => BUSINESS_CATEGORIES[index] === category) || (name === 'Otros' && !BUSINESS_CATEGORIES.some(item => item === category))) })).filter(group => group.categories.length),
  icons: Object.fromEntries(BUSINESS_CATEGORIES.map((name, index) => [name, ['🍽️','🍔','🍕','☕','🍦','🍷','🛒','🛍️','💎','👟','💈','💇','🐾','💊','🔨','🌱','💪','🏍️','🔧','🛡️','✨'][index]])),
});
export const defaultBusinessSettings = (categories: string[]): BusinessCategorySettings => completeBusinessSettings(categories, initialBusinessSettings(categories));
export const completeBusinessSettings = (categories: string[], settings?: BusinessCategorySettings): BusinessCategorySettings => {
  const source = settings && Array.isArray(settings.groups) ? settings : initialBusinessSettings(categories);
  const catalog = completeCatalog('sponsors', categories, source.catalog);
  const assigned = new Set<string>();
  const icons: Record<string, string> = {};
  const groups = source.groups.map(group => {
    const names = group.categoryIds ? group.categoryIds.map(id => catalog.find(record => record.id === id)?.name).filter(Boolean) : (group.categories || []);
    return {
      id: group.id || categoryId('sponsor-groups', group.name), name: group.name, icon: group.icon,
      categories: sortCategories(names.map(name => findCategory(catalog, name)?.name || name).filter(name => catalog.some(record => record.name === name) && !assigned.has(name) && Boolean(assigned.add(name)))),
    };
  });
  catalog.forEach(record => { icons[record.name] = source.icons?.[record.id] || source.icons?.[record.name] || record.aliases.map(alias => source.icons?.[alias]).find(Boolean) || '🏪'; });
  const missing = catalog.map(record => record.name).filter(name => !assigned.has(name));
  if (missing.length) {
    const unclassified = groups.find(group => group.id === categoryId('sponsor-groups', 'Sin clasificar'));
    if (unclassified) unclassified.categories = sortCategories([...unclassified.categories, ...missing]);
    else groups.push({ id: categoryId('sponsor-groups', 'Sin clasificar'), name: 'Sin clasificar', icon: '🏪', categories: missing });
  }
  return { groups: groups.sort((a, b) => compareCategories(a.name, b.name)), icons, catalog };
};
